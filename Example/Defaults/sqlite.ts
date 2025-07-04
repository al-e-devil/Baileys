import sqlite3 from 'sqlite3';
import { Database, open } from "sqlite";
import { performance } from 'perf_hooks';
import { Logger } from "pino";
import { AuthenticationState, BufferJSON, initAuthCreds, proto } from '../../src';

export default new class SQLite {
    private instance: Database | null = null;

    async getDatabaseConnection(filename: string, customLogger: Logger): Promise<Database> {
        if (this.instance) return this.instance;

        this.instance = await open({
            filename: filename,
            driver: sqlite3.Database
        });

        await this.instance.exec(`
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA temp_store = MEMORY;
            PRAGMA mmap_size = 268435456;
            PRAGMA cache_size = -64000;
            CREATE TABLE IF NOT EXISTS auth_state (
                session_id TEXT,
                data_key TEXT,
                data_value TEXT,
                PRIMARY KEY (session_id, data_key)
            ) WITHOUT ROWID;
            CREATE INDEX IF NOT EXISTS idx_session_key ON auth_state (session_id, data_key);
        `);

        customLogger.debug('Database connection established and configured');

        return this.instance;
    }

    async profile<T>(name: string, fn: () => Promise<T>, logger: Logger): Promise<T> {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        logger.debug(`${name} took ${(end - start).toFixed(2)} ms`)
        return result
    }

    async AuthState(sessionId: string, filename: string, customLogger: Logger): Promise<{
        state: AuthenticationState,
        saveCreds: () => Promise<void>,
        deleteSession: () => Promise<void>
    }> {
        const logger = customLogger;
        const db = await this.getDatabaseConnection(filename, customLogger);

        const writeData = async (key: string, data: any) => {
            const serialized = JSON.stringify(data, BufferJSON.replacer);
            await db.run('INSERT OR REPLACE INTO auth_state (session_id, data_key, data_value) VALUES (?, ?, ?)', [sessionId, key, serialized]);
        };

        const readData = async (key: string): Promise<any | null> => {
            const row = await db.get<{ data_value: string }>('SELECT data_value FROM auth_state WHERE session_id = ? AND data_key = ?', [sessionId, key]);
            return row?.data_value ? JSON.parse(row.data_value, BufferJSON.reviver) : null;
        };

        const creds = await this.profile('readCreds', () => readData('auth_creds'), logger) || initAuthCreds();

        const state: AuthenticationState = {
            creds,
            keys: {
                get: async (type: string, ids: string[]) => {
                    return this.profile('keys.get', async () => {
                        const data: { [id: string]: any } = {};
                        if (!ids.length) return data;
                        const placeholders = ids.map(() => '?').join(',');
                        const query = `SELECT data_key, data_value FROM auth_state WHERE session_id = ? AND data_key IN (${placeholders})`;
                        const params = [sessionId, ...ids.map(id => `${type}-${id}`)];
                        const rows = await db.all<{ data_key: string, data_value: string }[]>(query, params);
                        rows.forEach(row => {
                            const id = row.data_key.split('-')[1];
                            let value = JSON.parse(row.data_value, BufferJSON.reviver);
                            if (type === 'app-state-sync-key') {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            data[id] = value;
                        });
                        return data;
                    }, logger);
                },
                set: async (data: Record<string, Record<string, any>>) => {
                    return this.profile('keys.set', async () => {
                        await db.run('BEGIN TRANSACTION');

                        const insert: any[] = [];
                        const deleteKeys: string[] = [];
                        for (const [category, categoryData] of Object.entries(data)) {
                            for (const [id, value] of Object.entries(categoryData || {})) {
                                const key = `${category}-${id}`;
                                if (value) {
                                    const serialized = JSON.stringify(value, BufferJSON.replacer);
                                    insert.push(sessionId, key, serialized);
                                } else {
                                    deleteKeys.push(key);
                                }
                            }
                        }

                        if (insert.length) {
                            const placeholders = new Array(insert.length / 3).fill('(?, ?, ?)').join(',');
                            await db.run(`INSERT OR REPLACE INTO auth_state (session_id, data_key, data_value) VALUES ${placeholders}`, insert);
                        }

                        if (deleteKeys.length) {
                            const placeholders = deleteKeys.map(() => '?').join(',');
                            await db.run(`DELETE FROM auth_state WHERE session_id = ? AND data_key IN (${placeholders})`, [sessionId, ...deleteKeys]);
                        }

                        await db.run('COMMIT');
                    }, logger);
                },
            },
        };

        return {
            state,
            saveCreds: async () => {
                await this.profile('saveCreds', () => writeData('auth_creds', state.creds), logger);
            },
            deleteSession: async () => {
                await this.profile('deleteSession', () => db.run('DELETE FROM auth_state WHERE session_id = ?', sessionId), logger);
            },
        };
    }
}

