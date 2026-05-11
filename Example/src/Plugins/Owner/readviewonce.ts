export default {
    name: 'ReadViewOnce',
    description: 'Extrae y reenvia media view-once',
    command: ['rvo', 'readviewonce'],
    isOwner: false,
    exec: async (m: any, { sock }: { sock: any }) => {
        if (!m.quoted) return m.reply(`Responde a un mensaje con *${m.prefix}readviewonce*`)
        if (!m.quoted.isMedia) return m.reply('El mensaje citado no contiene media compatible.')
        if (!m.quoted.isViewOnce) return m.reply('El mensaje citado no es view-once.')

        const mediaType = (m.quoted.type || '').replace('Message', '')
        const buffer = await m.quoted.download()

        await sock.sendMessage(m.from, {
            [mediaType]: buffer,
            caption: m.quoted.body
        }, { quoted: m })

        return m.react('✅')
    }
}