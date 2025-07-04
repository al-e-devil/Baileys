import makeWASocket, {
    GroupMetadata,
    UserFacingSocketConfig,
    WASocket as BaileysSocket
} from "../../src"

export const groupMetadata = new Map<string, GroupMetadata>()

export interface AuralixExtensions {
    fetchGroup(jid: string): Promise<GroupMetadata | undefined>
}

const auralixExtensions: AuralixExtensions = {
    async fetchGroup(this: BaileysSocket, jid: string): Promise<GroupMetadata | undefined> {
        const cached = groupMetadata.get(jid)
        if (cached) {
            const meta = await this.groupMetadata(jid).catch(() => null)
            if (!meta) return
            groupMetadata.set(jid, meta)
            return cached
        }
        return cached
    }
    
}


export function WASocket(
    config: UserFacingSocketConfig
): BaileysSocket & AuralixExtensions {
    const socket = makeWASocket(config)
    Object.entries(auralixExtensions).forEach(([key, fn]) => {
        socket[key] = typeof fn === "function" ? fn.bind(socket) : fn
    })
    return socket as BaileysSocket & AuralixExtensions
}

export type AuralixSocket = ReturnType<typeof WASocket>