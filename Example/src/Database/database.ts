import Database from 'better-sqlite3';
import * as Proto from '../../proto/database.js';


import fs from 'fs';
import path from 'path';

export class database {
    public data: Proto.database.ICollection;
    private db: Database.Database;
    private q: Record<string, Database.Statement> = {};
    private c = 0;

    constructor(p: string) {
        const d = path.dirname(p);
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });

        this.db = new Database(p);
        this.db.exec(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS store (id INTEGER PRIMARY KEY, data BLOB);
            CREATE TABLE IF NOT EXISTS msgs (id TEXT PRIMARY KEY, jid TEXT, me INTEGER, part TEXT, json TEXT, ts INTEGER);
            CREATE INDEX IF NOT EXISTS idx_ts ON msgs (ts);
        `);

        this.q.s = this.db.prepare('INSERT OR REPLACE INTO msgs VALUES (?, ?, ?, ?, ?, ?)'); // s = save
        this.q.m = this.db.prepare('SELECT json FROM msgs WHERE id = ?'); // m = get msg
        this.q.p = this.db.prepare('DELETE FROM msgs WHERE id IN (SELECT id FROM msgs ORDER BY ts ASC LIMIT 100)'); // p = prune
        this.q.c = this.db.prepare('SELECT COUNT(*) as c FROM msgs'); // c = count
        this.q.w = this.db.prepare('INSERT OR REPLACE INTO store (id, data) VALUES (1, ?)'); // w = write storage
        this.q.r = this.db.prepare('SELECT data FROM store WHERE id = 1'); // r = read storage

        this.data = Proto.database.Collection.create({ users: {}, groups: {} });
        this.read();
    }

    public read() {
        const row = this.q.r.get() as { data: Buffer } | undefined;
        if (!row) return

        try {
            this.data = Proto.database.Collection.decode(row.data);
        } catch {
            this.data = Proto.database.Collection.create({ users: {}, groups: {} });
        }
    }

    public write() {
        const buf = Proto.database.Collection.encode(this.data).finish();
        this.q.w.run(Buffer.from(buf));
    }

    public saveMessage(m: any) {
        try {
            if (!m?.key?.id || !m?.key?.remoteJid) return

            const ts = typeof m.messageTimestamp === "number" ? m.messageTimestamp : Number(m.messageTimestamp) || Math.floor(Date.now() / 1000)

            this.q.s.run(m.key.id, m.key.remoteJid, m.key.fromMe ? 1 : 0, m.key.participant || '', JSON.stringify(m.message), ts);
            if (++this.c >= 50) {
                this.c = 0;
                if ((this.q.c.get() as any).c > 1000) this.q.p.run();
            }
        } catch { }
    }

    public getMessage(id: string) {
        const row = this.q.m.get(id) as { json: string } | undefined;
        return row ? JSON.parse(row.json) : null;
    }

    public user(id: string, name = 'User') {
        if (!this.data.users) this.data.users = {};

        const users = this.data.users as Record<string, Proto.database.IUser>
        const createdAt = Date.now()
        const defaults: Proto.database.IUser = {
            email: "",
            passwordHash: "",
            banned: false,
            name,
            age: 0,
            createdAt,
            updatedAt: createdAt,
            coins: 0,
            xp: 0,
            level: 1,
            warns: 0,
            number: id.replace("@s.whatsapp.net", ""),
            language: "es",
            timezone: "UTC",
            country: "",
            registered: false,
            blacklist: false
        }

        const current = (users[id] ?? {}) as Record<string, unknown>
        let changed = false

        for (const [k, v] of Object.entries(defaults)) {
            if (current[k] === undefined || current[k] === null) {
                current[k] = v
                changed = true
            }
        }

        if (typeof name === "string" && name.trim().length > 0 && current.name !== name) {
            current.name = name
            changed = true
        }

        if (changed) {
            current.updatedAt = Date.now()
            users[id] = current as Proto.database.IUser
            this.write()
        } else {
            users[id] = current as Proto.database.IUser
        }

        return this.data.users[id];
    }

    public group(id: string) {
        if (!this.data.groups) this.data.groups = {};

        const groups = this.data.groups as Record<string, Proto.database.IGroup>
        const defaults: Proto.database.IGroup = {
            prefix: '@',
            welcome: '',
            bye: '',
            mute: false,
            welcomeEnabled: false,
            name: '',
            code: '',
            antilink: {
                status: false,
                platforms: {}
            },
            antiporn: false,
            antionce: false,
            antifake: false,
            antitoxic: false,
            antidelete: false,
            notifications: {}
        }

        const current = (groups[id] ?? {}) as Record<string, unknown>
        let changed = false

        for (const [k, v] of Object.entries(defaults)) {
            if (current[k] === undefined || current[k] === null) {
                current[k] = v
                changed = true
            }
        }

        if (typeof current.antilink !== "object" || current.antilink === null) {
            current.antilink = {
                status: Boolean(current.antilink),
                platforms: {}
            }
            changed = true
        }

        const antiLinkObj = current.antilink as { status?: boolean; platforms?: Record<string, boolean> }
        if (!antiLinkObj.platforms || typeof antiLinkObj.platforms !== "object") {
            antiLinkObj.platforms = {}
            changed = true
        }

        if (!current.notifications || typeof current.notifications !== "object") {
            current.notifications = {}
            changed = true
        }

        if (changed) {
            groups[id] = current as Proto.database.IGroup
            this.write()
        } else {
            groups[id] = current as Proto.database.IGroup
        }

        return this.data.groups[id];
    }
}

export const db = new database('./Example/Database/database.db');