import os from "os"
import config from "../config"

export default {
    name: "SystemInfo",
    description: "Muestra información del sistema (CPU, RAM, memoria, etc.)",
    command: ["info", "system", "sys"],
    exec: async (m: any, { sock }: { sock: any }) => {
        try {
            const cpus = os.cpus()
            const cpuModel = cpus[0].model
            const cpuCores = cpus.length
            const cpuSpeed = cpus[0].speed

            const totalMemory = os.totalmem()
            const freeMemory = os.freemem()
            const usedMemory = totalMemory - freeMemory
            const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2)

            const platform = os.platform()
            const arch = os.arch()
            const hostname = os.hostname()
            const osVersion = os.version()
            const osType = os.type()

            const systemUptimeSeconds = os.uptime()
            const systemUptime = formatUptime(systemUptimeSeconds)

            const processUptimeSeconds = process.uptime()
            const processUptime = formatUptime(processUptimeSeconds)

            const processMemory = process.memoryUsage()

            const nodeVersion = process.version

            const message = `╭━━━━━━━━━━━━━━━━━━╮
┃ *${config.bot.name} - INFO DEL SISTEMA* ┃
╰━━━━━━━━━━━━━━━━━━╯

┌──「 💻 *SISTEMA OPERATIVO* 」
│ • *SO:* ${osType}
│ • *Plataforma:* ${platform}
│ • *Arquitectura:* ${arch}
│ • *Versión:* ${osVersion}
│ • *Hostname:* ${hostname}
│ • *Uptime:* ${systemUptime}
└────────────────

┌──「 🧠 *CPU* 」
│ • *Modelo:* ${cpuModel}
│ • *Núcleos:* ${cpuCores}
│ • *Velocidad:* ${cpuSpeed} MHz
└────────────────

┌──「 💾 *MEMORIA RAM* 」
│ • *Total:* ${formatBytes(totalMemory)}
│ • *Usada:* ${formatBytes(usedMemory)} (${memoryUsagePercent}%)
│ • *Libre:* ${formatBytes(freeMemory)}
└────────────────

┌──「 🤖 *BOT (Proceso)* 」
│ • *Node.js:* ${nodeVersion}
│ • *Uptime:* ${processUptime}
│ • *Memoria Heap:* ${formatBytes(processMemory.heapUsed)} / ${formatBytes(processMemory.heapTotal)}
│ • *Memoria RSS:* ${formatBytes(processMemory.rss)}
└────────────────

┌──「 ℹ️ *INFO BOT* 」
│ • *Nombre:* ${config.bot.name}
│ • *Versión:* ${config.bot.version}
│ • *Autor:* ${config.bot.author}
└────────────────`

            await sock.sendMessage(m.from, { text: message })
        } catch (error) {
            console.error("Error al obtener información del sistema:", error)
            await sock.sendMessage(m.from, {
                text: "❌ Error al obtener la información del sistema."
            })
        }
    }
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts = []
    if (days > 0) parts.push(`${days}d`)
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

    return parts.join(' ')
}