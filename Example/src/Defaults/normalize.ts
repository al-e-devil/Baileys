import { jidNormalizedUser, proto, getContentType, extractMessageContent, normalizeMessageContent, downloadMediaMessage } from "../../../src";

import { Auralix } from "./core";
import config from "../config"
import { db } from "../Database/database"
import type { MsgCtx } from "../@Types"

export async function Sms(sock: Auralix, m: any): Promise<MsgCtx | null> {
    if (!m) return null

    m = m as proto.IWebMessageInfo & { id?: string; from?: string; body?: string }

    if (m.key.remoteJid == "status@broadcast" || m.broadcast || !m.message) return null
    if (!m.key?.id || !m.key?.remoteJid) return null
    if (m.key.id.startsWith("NZT")) return null

    m.message = normalizeMessageContent(m.message)

    if (m.message?.senderKeyDistributionMessage) delete m.message.senderKeyDistributionMessage
    if (m.message?.messageContextInfo) delete m.message.messageContextInfo

    if (m.key) {
        m.id = m.key.id
        m.device = m.id.length > 28 ? 'android' : m.id.substring(0, 2) === '3A' ? 'ios' : m.id.startsWith("BAE5") ? 'baileys' : m.id.startsWith("3EB0") ? 'web' : 'desconocido';
        m.isBot = (m.id.startsWith("3EB0") && m.id.length == 12) || (m.id.startsWith("BAE5") && m.id.length == 16)
        m.from = m.key.remoteJid
        m.isMe = m.key.fromMe
        m.isGroup = m.from.endsWith("@g.us")
        m.isChat = m.from.endsWith("@s.whatsapp.net")
        m.sender = jidNormalizedUser(m.key.participant || m.key.remoteJid)
        m.number = m.sender.replace("@s.whatsapp.net", "")
        m.isOwner = [config.owner.number, ...(config.mods || [])].includes(m.number) || m.isMe

        m.user = db.user(m.sender, m.pushName)
        if (m.isGroup) m.group = db.group(m.from)
    }

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = extractMessageContent(m.message)
        m.isViewOnce = Boolean(m?.msg?.viewOnce)
        m.isMedia = ["image", "sticker", "video", "audio"].some(i => m.type && i == m.type.replace("Message", ""))
        m.body = typeof m.msg === 'string' ? m.msg : m.type === 'conversation' ? m.message.conversation : m.type === 'extendedTextMessage' ? m.message.extendedTextMessage?.text : m.type === 'imageMessage' ? m.message.imageMessage?.caption : m.type === 'videoMessage' ? m.message.videoMessage?.caption : m.type === 'documentMessage' ? m.message.documentMessage?.caption : m.type === 'templateButtonReplyMessage' ? m.message.templateButtonReplyMessage?.selectedId : m.type === 'buttonsResponseMessage' ? m.message.buttonsResponseMessage?.selectedButtonId : m.type === 'listResponseMessage' ? m.message.listResponseMessage?.singleSelectReply?.selectedRowId : ''
        m.prefix = typeof m.body === "string" ? ([m.group?.prefix || config.prefix[0], ...config.prefix].find((p) => p && m.body.toLowerCase().startsWith(p.toLowerCase())) || (m.group?.prefix || config.prefix[0])) : (m.group?.prefix || config.prefix[0])

        m.cmd = typeof m.body === "string" && m.body.toLowerCase().startsWith(m.prefix.toLowerCase())
        m.command = m.cmd ? ((m.body.slice(m.prefix.length).trim().split(/\s+/).shift() || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || false) : false
        m.args = typeof m.body === 'string' ? m.body.trim().split(/\s+/).slice(m.cmd ? 1 : 0) : []
        m.text = Array.isArray(m.args) ? m.args.join(" ") : ""

        m.delete = () => sock.sendMessage(m.from, { delete: m.key })
        m.react = (emoji: string) => sock.sendMessage(m.from, { react: { text: emoji, key: m.key } })
        m.download = () => downloadMediaMessage(
            m,
            'buffer',
            {},
            { logger: undefined, reuploadRequest: sock.updateMediaMessage }
        )

        const ctxInfo = m.message?.[m.type]?.contextInfo
        m.quoted = ctxInfo && ctxInfo.quotedMessage
            ? {
                key: {
                    remoteJid: m.from || m.key.remoteJid,
                    fromMe: ctxInfo.participant === sock.user?.id,
                    id: ctxInfo.stanzaId,
                    participant: ctxInfo.participant
                },
                message: ctxInfo.quotedMessage
            }
            : false

        if (m.quoted) {
            if (m.quoted.key) {
                m.quoted.id = m.quoted.key.id
                m.quoted.device = m.quoted.id.length > 28 ? 'android' : m.quoted.id.substring(0, 2) === '3A' ? 'ios' : m.quoted.id.startsWith("BAE5") ? 'baileys' : m.quoted.id.startsWith("3EB0") ? 'web' : 'desconocido'
                m.quoted.isBot = (m.quoted.id.startsWith("3EB0") && m.quoted.id.length == 12) || (m.quoted.id.startsWith("BAE5") && m.quoted.id.length == 16)
                m.quoted.isMe = m.quoted.key.fromMe
                m.quoted.sender = jidNormalizedUser(m.quoted.key.participant || m.quoted.key.remoteJid)
                m.quoted.number = m.quoted.sender.replace("@s.whatsapp.net", "")
            }

            m.quoted.message = normalizeMessageContent(m.quoted.message)

            if (m.quoted.message) {
                m.quoted.type = getContentType(m.quoted.message)
                m.quoted.msg = extractMessageContent(m.quoted.message?.[m.quoted.type])
                m.quoted.isViewOnce = Boolean(m?.quoted?.msg?.viewOnce)
                m.quoted.isMedia = ["image", "sticker", "video", "audio"].some(i => m.quoted.type && i == m.quoted.type.replace("Message", ""))
                m.quoted.body = typeof m.quoted.msg === 'string' ? m.quoted.msg : m.quoted.type === 'conversation' ? m.quoted.message.conversation : m.quoted.type === 'extendedTextMessage' ? m.quoted.message.extendedTextMessage?.text : m.quoted.type === 'imageMessage' ? m.quoted.message.imageMessage?.caption : m.quoted.type === 'videoMessage' ? m.quoted.message.videoMessage?.caption : m.quoted.type === 'documentMessage' ? m.quoted.message.documentMessage?.caption : m.quoted.type === 'templateButtonReplyMessage' ? m.quoted.message.templateButtonReplyMessage?.selectedId : m.quoted.type === 'buttonsResponseMessage' ? m.quoted.message.buttonsResponseMessage?.selectedButtonId : m.quoted.type === 'listResponseMessage' ? m.quoted.message.listResponseMessage?.singleSelectReply?.selectedRowId : ''
                m.quoted.prefix = typeof m.quoted.body === "string" ? ([m.group?.prefix || config.prefix[0], ...config.prefix].find((p) => p && m.quoted.body.toLowerCase().startsWith(p.toLowerCase())) || (m.group?.prefix || config.prefix[0])) : (m.group?.prefix || config.prefix[0])
                m.quoted.cmd = typeof m.quoted.body === "string" && m.quoted.body.toLowerCase().startsWith(m.quoted.prefix.toLowerCase())
                m.quoted.command = m.quoted.cmd ? ((m.quoted.body.slice(m.quoted.prefix.length).trim().split(/\s+/).shift() || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || false) : false
                m.quoted.args = typeof m.quoted.body === 'string' ? m.quoted.body.trim().split(/\s+/).slice(m.quoted.cmd ? 1 : 0) : []
                m.quoted.text = Array.isArray(m.quoted.args) ? m.quoted.args.join(" ") : ""
            }

            m.quoted.delete = () => sock.sendMessage(m.from, { delete: m.quoted.key })
            m.quoted.react = (emoji: string) => sock.sendMessage(m.from, { react: { text: emoji, key: m.quoted.key } })
            m.quoted.download = () => downloadMediaMessage(
                m.quoted,
                'buffer',
                {},
                { logger: undefined, reuploadRequest: sock.updateMediaMessage }
            )
        }
    }

    m.reply = async (text: string, options: any = {}, quoted = m) => {
        return await sock.sendMessage(options.id ? options.id : m.from, {
            text: text,
            contextInfo: {
                mentionedJid: options.mentions || [],
                externalAdReply: {
                    renderLargerThumbnail: options.render || false,
                    showAdAttribution: options.adAttrib || false,
                    body: options.body || (config.bot.name + (typeof config.bot.version === "string" ? " - " + config.bot.version : "")),
                    mediaType: 1,
                    thumbnailUrl: options.img || "https://files.catbox.moe/o1y3t5.png",
                    sourceUrl: Math.random() > 0.5 ? "https://instagram.com/al.e.dev" : "https://www.github.com/al-e-dev"
                }
            }
        }, {
            quoted: options.quoted ? m : null,
            ephemeralExpiration: 20 * 60 * 1000
        })
    }

    return m as MsgCtx
}