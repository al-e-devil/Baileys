import type { proto, WASocket } from "../../../src"
import type { database } from "../Database/database"
import type { Auralix } from "../Defaults/core"
import type Request from "../Scraper/Request"

export interface User {
    email?: string
    passwordHash?: string
    banned?: boolean
    name: string
    age?: number
    coins: number
    xp: number
    level: number
    warns: number
    createdAt: number
    updatedAt: number
    number?: string
    language?: string
    timezone?: string
    country?: string
    registered?: boolean
    blacklist?: boolean
}

export interface Notify {
    message?: string
    status?: boolean
}

export interface AntiLink {
    status: boolean
    platforms: Record<string, boolean>
}

export interface Group {
    prefix: string
    welcome: string
    bye: string
    mute: boolean
    welcomeEnabled: boolean
    name?: string
    code?: string
    antilink: AntiLink
    antiporn?: boolean
    antionce?: boolean
    antifake?: boolean
    antitoxic?: boolean
    antidelete?: boolean
    notifications?: Record<string, Notify>
}

export interface MsgCtx {
    id: string
    device: string
    isOwner: boolean
    isBot: boolean
    from: string
    isMe: boolean
    isGroup: boolean
    isChat: boolean
    sender: string
    number: string
    user: User
    group?: Group
    type: string
    msg: any
    isViewOnce: boolean
    isMedia: boolean
    prefix: string
    body: string
    cmd: boolean
    command: string | false
    args: string[]
    text: string
    key: proto.IMessageKey
    delete: () => Promise<void>
    react: (emoji: string) => Promise<void>
    download: () => Promise<any>
    quoted: any | false
    reply: (text: string, options?: any, quoted?: any) => Promise<any>
}

export interface PluginArgs {
    sock: Auralix
    db: database
    r: typeof Request
}

export interface Plugin {
    name: string
    description: string
    disable?: boolean
    command?: string[] | RegExp
    exec?: (m: MsgCtx, ctx: PluginArgs) => Promise<any>
    start?: (m: MsgCtx, ctx: PluginArgs) => Promise<any>
    isOwner?: boolean
    path?: string
}

export interface Config {
    owner: {
        number: string
    }
    bot: {
        name: string
        author: string
        version: string
    }
    mods: string[]
    prefix: string[]
    log: {
        level: string
    }
}