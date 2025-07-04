import { jidNormalizedUser, proto, getContentType, extractMessageContent } from "../../src";
import { AuralixSocket } from "./core";
import config from "../config"

export async function Sms(sock: AuralixSocket, m: any): Promise<any> {
    if (!m) return

    const message = m as proto.IWebMessageInfo & { id?: string; from?: string; body?: string }

    if (m.key.remoteJid == "status@broadcast" || m.broadcast || !m.message) return
    if (m.key.id.startsWith("NZT") || m.key.id.startsWith("BAE5")) return

    m.message = (Object.keys(m.message)[0] == "ephemeralMessage") ? m.message["ephemeralMessage"].message : (Object.keys(m.message)[0] == "viewOnceMessageV2") ? m.message["viewOnceMessageV2"].message : (Object.keys(m.message)[0] == "documentWithCaptionMessage") ? m.message["documentWithCaptionMessage"].message : (Object.keys(m.message)[0] == "ptvMessage") ? { videoMessage: m.message["ptvMessage"] } : m.message

    if (m.message.senderKeyDistributionMessage) delete m.message.senderKeyDistributionMessage
    if (m.message.messageContextInfo) delete m.message.messageContextInfo

    if (m.key) {
        m.id = m.key.id
        m.device = m.id.length > 28 ? 'android' : m.id.substring(0, 2) === '3A' ? 'ios' : m.id.startsWith("BAE5") ? 'baileys' : m.id.startsWith("3EB0") ? 'web' : 'desconocido';
        m.isBot = (m.id.startsWith("3EB0") && m.id.length == 12) || (m.id.startsWith("BAE5") && m.id.length == 16)
        m.from = m.key.remoteJid
        m.isMe = m.key.fromMe
        m.isGroup = m.from.endsWith("@g.us")
        m.isChat = m.from.endsWith("@s.whatsapp.net")
        m.isNewsletter = m.from.endsWith("@newsletter")
        m.sender = jidNormalizedUser(m.key.participant || m.key.remoteJid)
        m.number = m.sender.replace("@s.whatsapp.net", "")
        m.pushName = m.pushName || "Sin Nombre"
        m.isOwner = m.isMe || (m.number === config.owner.number) || (config.mods.some((i: string) => i === m.number))
        if (m.isGroup && !m.isNewsletter) {
            m.metadata = m.from.endsWith("@g.us") ? await sock.groupMetadata(m.from) : false
            m.admins = m.from.endsWith("@g.us") ? m.metadata.participants.filter((i: any) => i.admin == "admin" || i.admin == "superadmin").map((i: any) => i.id) : false
            m.isAdmin = m.from.endsWith("@g.us") ? m.admins.includes(m.sender) : false
            m.isBotAdmin = m.from.endsWith("@g.us") && sock.user ? m.admins.includes(sock.user.id) : false
        }
    };

    if (m.message) {
        m.type = getContentType(m.message)
        m.msg = extractMessageContent(m.message?.[m.type])
        m.isViewOnce = m?.msg?.viewOnce ? m?.msg?.viewOnce : false
        m.isMedia = ["image", "sticker", "video", "audio"].some(i => m.type && i == m.type.replace("Message", ""))
        m.body = m.msg || m.msg?.caption || m.msg?.text || m.msg?.conversation
        m.cmd = false
        m.command = false
        m.args = []
        if (typeof m.body === 'string') {
            for (const prefix of config.prefix) {
                if (m.body.toLowerCase().startsWith(prefix.toLowerCase())) {
                    const regex = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^a-zA-Z0-9]*([a-zA-Z0-9]+)`, 'i')
                    const match = m.body.match(regex)
                    if (match) {
                        m.cmd = true
                        m.command = match[1].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                        m.args = m.body.trim().split(/\s+/).slice(1)
                        break
                    }
                }
            }
        }
        m.text = Array.isArray(m.args) ? m.args.join(" ") : ""

        let protocolMessageKey: any
        if (m.type == 'protocolMessage' && m.msg?.key) {
            protocolMessageKey = m.msg.key
            if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.from
            if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
            protocolMessageKey.fromMe = sock.user && protocolMessageKey.participant === sock.user.id
            if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === (sock.user && sock.user.id)) protocolMessageKey.remoteJid = m.sender
        }

        if (protocolMessageKey && m.type == 'protocolMessage') {
            sock.ev.emit('messages.delete', { keys: [protocolMessageKey] })
        }

        let quotedMention = m.msg?.contextInfo != null ? m.msg.contextInfo?.participant : ''
        let tagMention = m.msg?.contextInfo != undefined ? m.msg.contextInfo?.mentionedJid : []
        let mention = typeof (tagMention) == 'string' ? [tagMention] : tagMention
        if (mention != undefined && quotedMention) mention.push(quotedMention)

        m.mentionedJid = mention != undefined ? mention.filter((x: string) => x) : []
        m.delete = () => sock.sendMessage(m.from, { delete: m.key })
        m.react = (emoji: string) => sock.sendMessage(m.from, { react: { text: emoji, key: m.key } })
        m.download = () => undefined

        m.quoted = false
    }

    m.reply = async (text: string, options: any = {}, quoted = m) => {
        const p = Math.random() > 0.5 ? 1 : 0

        return await sock.sendMessage(options.id ? options.id : m.from, {
            text: text,
            contextInfo: {
                mentionedJid: options.mentions ? options.mentions : [],
                externalAdReply: {
                    renderLargerThumbnail: options.render ? options.render : false,
                    showAdAttribution: options.adAttrib ? options.adAttrib : false,
                    body: options.body ? options.body : (config.bot.name + (typeof config.bot.version === "string" ? " - " + config.bot.version : "")),
                    mediaType: 1,
                    thumbnailUrl: options.img ? options.img : "https://files.catbox.moe/o1y3t5.png",
                    sourceUrl: (p == 1) ? "https://instagram.com/al.e.dev" : "https://www.github.com/al-e-dev"
                }
            }
        }, {
            quoted: options.quoted ? options.quoted : null,
            ephemeralExpiration: 20 * 60 * 100
        })
    }

    return message
}
