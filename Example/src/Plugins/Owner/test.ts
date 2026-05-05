export default {
    name: "test",
    description: "test",
    command: ["test", "t"],
    exec: async (m: any, { sock, Baileys, proto }: { sock: any, Baileys: any, proto: any }) => {
        const jid = m.from || m.key.remoteJid
        if (!jid) return

        const args = m.body ? m.body.split(" ").slice(1) : []
        const type = args[0]?.toLowerCase() || "ayuda"

        const { imageMessage } = await Baileys.prepareWAMessageMedia(
            { image: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" } },
            { upload: sock.waUploadToServer }
        )

        let msgContent: any

        switch (type) {
            case "carousel":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: "Demo Carrusel" }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Bot de Prueba" }),
                        header: proto.Message.InteractiveMessage.Header.create({ title: "Bienvenido", hasMediaAttachment: false }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
                            cards: [
                                {
                                    body: proto.Message.InteractiveMessage.Body.create({ text: "Card 1: Google" }),
                                    header: proto.Message.InteractiveMessage.Header.create({ title: "Google", hasMediaAttachment: true, imageMessage }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Ir a Google", url: "https://google.com" }) }]
                                    })
                                },
                                {
                                    body: proto.Message.InteractiveMessage.Body.create({ text: "Card 2: Ping" }),
                                    header: proto.Message.InteractiveMessage.Header.create({ title: "Sistema", hasMediaAttachment: true, imageMessage }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: [{ name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Ver Ping", id: ".ping" }) }]
                                    })
                                }
                            ]
                        })
                    })
                }
                break

            case "botones":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: "Estos son botones nativos sin carrusel" }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Footer" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Ping", id: ".ping" }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Menu", id: ".menu" }) }
                            ]
                        })
                    })
                }
                break

            case "lista":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: "Selecciona una opción de la lista nativa" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Abrir Lista",
                                    sections: [{
                                        title: "Categorías",
                                        rows: [
                                            { title: "Velocidad", description: "Ver ping", id: ".ping" },
                                            { title: "Menu", description: "Ver comandos", id: ".menu" }
                                        ]
                                    }]
                                })
                            }]
                        })
                    })
                }
                break

            case "cta":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: "Botones de Acción Especiales" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                { name: "cta_call", buttonParamsJson: JSON.stringify({ display_text: "Llamar", phone_number: "123456789" }) },
                                { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copiar ID", copy_code: "ABC-123" }) },
                                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Soporte", url: "https://wa.me/12345" }) }
                            ]
                        })
                    })
                }
                break

            default:
                await sock.sendMessage(jid, { text: "Uso: .test [carousel | botones | lista | cta]" }, { quoted: m })
                return
        }

        const msg = await Baileys.generateWAMessageFromContent(jid, { viewOnceMessage: { message: msgContent } }, { userJid: sock.user?.id, quoted: m })
        await sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
    }
}
