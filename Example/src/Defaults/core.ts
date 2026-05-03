import makeWASocket, { GroupMetadata, UserFacingSocketConfig } from "../../../src"

export const groupMetadata = new Map<string, GroupMetadata>()

setInterval(() => {
    if (groupMetadata.size > 100) {
        const toDelete = Array.from(groupMetadata.keys()).slice(0, Math.floor(groupMetadata.size * 0.3))
        toDelete.forEach(jid => groupMetadata.delete(jid))
    }
}, 5 * 60 * 1000).unref?.()

export function Sock(config: UserFacingSocketConfig) {
    const sock = makeWASocket(config)

    return Object.assign(sock, {
        async fetchGroup(jid: string) {
            let m = groupMetadata.get(jid)
            if (!m) {
                m = await sock.groupMetadata(jid).catch(() => undefined)
                if (m) groupMetadata.set(jid, m)
            } else {
                sock.groupMetadata(jid).then(res => groupMetadata.set(jid, res)).catch(() => null)
            }
            return m
        },
    })
}

export type Auralix = ReturnType<typeof Sock>