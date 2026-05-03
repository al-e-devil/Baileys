import Database from 'better-sqlite3';
import { performance } from 'perf_hooks';
import { Logger } from "pino";
import { AuthenticationState, BufferJSON, initAuthCreds, proto } from '../../../src';

import fs from 'fs';
import path from 'path';

export default new class SQLite {
    private instance: Database.Database | null = null;

    getDatabaseConnection(filename: string, customLogger: Logger): Database.Database {
        if (this.instance) return this.instance;

        const dir = path.dirname(filename);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        this.instance = new Database(filename);

        this.instance.exec(`
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

        customLogger.debug('Database connection established and configured (better-sqlite3)');

        return this.instance;
    }

    profile<T>(name: string, fn: () => T, logger: Logger): T {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        logger.debug(`${name} took ${(end - start).toFixed(2)} ms`)
        return result
    }

    async AuthState(sessionId: string, filename: string, logger: Logger): Promise<{
        state: AuthenticationState,
        saveCreds: () => Promise<void>,
        deleteSession: () => Promise<void>
    }> {
        const db = this.getDatabaseConnection(filename, logger);

        const writeData = (key: string, data: any) => {
            const serialized = JSON.stringify(data, BufferJSON.replacer);
            db.prepare('INSERT OR REPLACE INTO auth_state (session_id, data_key, data_value) VALUES (?, ?, ?)').run(sessionId, key, serialized);
        };

        const readData = (key: string): any | null => {
            const row = db.prepare('SELECT data_value FROM auth_state WHERE session_id = ? AND data_key = ?').get(sessionId, key) as { data_value: string } | undefined;
            return row?.data_value ? JSON.parse(row.data_value, BufferJSON.reviver) : null;
        };

        const creds = this.profile('readCreds', () => readData('auth_creds'), logger) || initAuthCreds();

        const state: AuthenticationState = {
            creds,
            keys: {
                get: async (type: string, ids: string[]) => {
                    return this.profile('keys.get', () => {
                        const data: { [id: string]: any } = {};
                        if (!ids.length) return data;

                        const placeholders = ids.map(() => '?').join(',');
                        const query = `SELECT data_key, data_value FROM auth_state WHERE session_id = ? AND data_key IN (${placeholders})`;
                        const params = [sessionId, ...ids.map(id => `${type}-${id}`)];

                        const rows = db.prepare(query).all(...params) as { data_key: string, data_value: string }[];

                        rows.forEach(row => {
                            const id = row.data_key.substring(type.length + 1);
                            let value = JSON.parse(row.data_value, BufferJSON.reviver);
                            if (type === 'app-state-sync-key') {
                                value = proto.Message.AppStateSyncKeyData.create(value);
                            }
                            data[id] = value;
                        });
                        return data;
                    }, logger);
                },
                set: async (data: Record<string, Record<string, any>>) => {
                    return this.profile('keys.set', () => {
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

                        const transaction = db.transaction(() => {
                            const size = 300;
                            for (let i = 0; i < insert.length; i += size * 3) {
                                const chunk = insert.slice(i, i + size * 3);
                                const placeholders = new Array(chunk.length / 3).fill('(?, ?, ?)').join(',');
                                db.prepare(`INSERT OR REPLACE INTO auth_state (session_id, data_key, data_value) VALUES ${placeholders}`).run(...chunk);
                            }

                            for (let i = 0; i < deleteKeys.length; i += size) {
                                const chunk = deleteKeys.slice(i, i + size);
                                const placeholders = chunk.map(() => '?').join(',');
                                db.prepare(`DELETE FROM auth_state WHERE session_id = ? AND data_key IN (${placeholders})`).run(sessionId, ...chunk);
                            }
                        });

                        transaction();
                    }, logger);
                },
            },
        };

        return {
            state,
            saveCreds: async () => {
                this.profile('saveCreds', () => writeData('auth_creds', state.creds), logger);
            },
            deleteSession: async () => {
                this.profile('deleteSession', () => db.prepare('DELETE FROM auth_state WHERE session_id = ?').run(sessionId), logger);
            },
        };
    }
}