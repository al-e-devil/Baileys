import {
    AuthenticationCreds,
    BaileysEventMap,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} from "../src";

import { Boom } from "@hapi/boom";
import QRCode from "qrcode";
import pino, { Logger } from "pino";
import speed from "performance-now";

import { Sms } from "./Defaults/normalize"
import { groupMetadata, WASocket } from "./Defaults/core"
import SQLite from "./Defaults/sqlite"
import { db } from "./Database/database"

const start = async (): Promise<void> => {
    const DEFAULT_CACHE_NAME = "open"
    let retries = 0
    const session = new Map<string, ReturnType<typeof WASocket>>()
    const logger: Logger = pino({ level: "silent" })
    let { state, saveCreds } = await SQLite.AuthState('socket', 'Example/auth.db', logger)

    let { version } = await fetchLatestBaileysVersion()
    let auralix = WASocket({
        browser: Browsers.ubuntu('Chrnomiun'),
        auth: { creds: state.creds as AuthenticationCreds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'debug' })) },
        cachedGroupMetadata: async (jid: string) => groupMetadata.get(jid),
        logger: logger,
        version: version
    })

    await db.read()
    auralix?.ev.process(async (ev: Partial<BaileysEventMap>) => {
        if (!ev) return
        if (ev['creds.update']) await saveCreds()
        if (ev["connection.update"]) {
            const up = ev["connection.update"];
            const { qr, connection, lastDisconnect } = up

            if (qr) {
                console.log('[ ! ]' + "scan this qr")
                QRCode.toString(qr, {
                    type: "terminal",
                    errorCorrectionLevel: "L",
                }).then(console.log)
            }
            switch (connection) {
                case 'open':
                    return
                case 'close': {
                    const reason = new Boom(lastDisconnect?.error).output.statusCode
                    let text: string
                    switch (reason) {
                        case DisconnectReason.connectionLost:
                        case DisconnectReason.forbidden:
                        case DisconnectReason.badSession:
                        case DisconnectReason.timedOut:
                        case DisconnectReason.unavailableService:
                            if (retries <= 3) {
                                retries++
                                await start()
                            } else {
                                text = `[ ! ] connection closed: ${reason}`
                                console.log(text)
                                session.delete(DEFAULT_CACHE_NAME)
                                process.exit(1)
                            }
                            break
                        case DisconnectReason.connectionClosed:
                        case DisconnectReason.connectionReplaced:
                            text = `[ ! ] connection closed: ${reason}`
                            console.log(text)
                            session.delete(DEFAULT_CACHE_NAME)
                            break
                        case DisconnectReason.restartRequired:
                            await start()
                            break
                        default:
                            text = `[ ! ] connection closed: ${reason}`
                            console.log(text)
                            session.delete(DEFAULT_CACHE_NAME)
                            break
                    }
                    break
                }
            }
        }
        if (ev["messages.upsert"]) {
            for (const message of ev["messages.upsert"].messages) {
                if (ev["messages.upsert"].type === "notify" && message.message) {
                    const m = await Sms(auralix, message)

                    if (m.command === 't') {
                        auralix.sendMessage(m.from, {
                            text: "Hi!",
                            footer: "FOOTER",
                            buttons: [
                                { buttonId: 'one', buttonText: { displayText: 'one' } },
                                { buttonId: 'two', buttonText: { displayText: 'two' } }
                            ],
                            viewOnce: true
                        })
                    }
                    if (m.command === 'ping') {
                        let timestampe = speed()
                        let latensie = speed() - timestampe
                        await auralix.sendMessage(m.from, { text: `*Velocidad de respuesta: ${latensie.toFixed(3)} ms*` })
                    }

                }
            }

        }
    })
}
start().catch(console.error)