export default {
    name: "test",
    description: "implementación absoluta y exhaustiva de mensajes de whatsapp",
    command: ["test", "t"],
    exec: async (m: any, { sock, Baileys, proto }: { sock: any, Baileys: any, proto: any }) => {
        const jid = m.from || m.key.remoteJid
        if (!jid) return

        const args = m.body ? m.body.split(" ").slice(1) : []
        const type = args[0]?.toLowerCase() || "ayuda"

        // Preparar medios base
        const { imageMessage } = await Baileys.prepareWAMessageMedia(
            { image: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" } },
            { upload: sock.waUploadToServer }
        )

        let msgContent: any
        let useGenerateWAMessage = true
        let options: any = { userJid: sock.user?.id, quoted: m }

        switch (type) {
            // ==========================================
            // 1. AIRichResponseMessage (Meta AI)
            // ==========================================
            case "airich_completo":
                msgContent = {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            { messageType: 2, messageText: "*Reporte de IA Multimodal*" },
                            {
                                messageType: 4, // TABLE
                                tableMetadata: {
                                    title: "Tabla de Datos",
                                    rows: [
                                        { items: ["Métrica", "Valor"], isHeading: true },
                                        { items: ["CPU", "45%"] },
                                        { items: ["RAM", "2GB"] }
                                    ]
                                }
                            },
                            {
                                messageType: 5, // CODE
                                codeMetadata: {
                                    codeLanguage: "typescript",
                                    codeBlocks: [{ highlightType: 1, codeContent: "const a = 10;\nconsole.log(a);" }]
                                }
                            },
                            {
                                messageType: 8, // LATEX
                                latexMetadata: {
                                    text: "Fórmula de Relatividad",
                                    expressions: [{ latexExpression: "E = mc^2" }]
                                }
                            },
                            {
                                messageType: 7, // MAP
                                mapMetadata: {
                                    centerLatitude: 37.422,
                                    centerLongitude: -122.084,
                                    annotations: [{ annotationNumber: 1, latitude: 37.422, longitude: -122.084, title: "HQ" }]
                                }
                            },
                            {
                                messageType: 1, // GRID IMAGE
                                gridImageMetadata: {
                                    gridImageUrl: { imagePreviewUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" },
                                    imageUrls: [{ imagePreviewUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" }]
                                }
                            }
                        ]
                    }
                }
                break

            // ==========================================
            // 2. InteractiveMessage (Native Flow Total)
            // ==========================================
            case "interactive_full":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: { text: "Explora todas las funciones nativas" },
                        footer: { text: "WhatsApp Native Flow" },
                        header: { title: "Panel de Control", hasMediaAttachment: true, imageMessage },
                        nativeFlowMessage: {
                            buttons: [
                                { name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Abrir GitHub", url: "https://github.com" }) },
                                { name: "cta_call", buttonParamsJson: JSON.stringify({ display_text: "Llamar Soporte", phone_number: "12345" }) },
                                { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copiar ID", copy_code: "NATIVE-99" }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Ping", id: ".ping" }) },
                                { name: "single_select", buttonParamsJson: JSON.stringify({ title: "Menu", sections: [{ title: "X", rows: [{ title: "A", id: "1" }] }] }) },
                                { name: "location_picker", buttonParamsJson: "{}" },
                                { name: "address_message", buttonParamsJson: "{}" },
                                { name: "review_order", buttonParamsJson: JSON.stringify({ items: [{ sku: "1", qty: 1 }] }) }
                            ]
                        }
                    })
                }
                break

            case "carousel_full":
                msgContent = {
                    interactiveMessage: {
                        carouselMessage: {
                            cards: [
                                {
                                    body: { text: "Card URL" },
                                    header: { title: "Enlace", hasMediaAttachment: true, imageMessage },
                                    nativeFlowMessage: { buttons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Ir", url: "https://google.com" }) }] }
                                },
                                {
                                    body: { text: "Card Copy" },
                                    header: { title: "Copiado", hasMediaAttachment: true, imageMessage },
                                    nativeFlowMessage: { buttons: [{ name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copiar", copy_code: "123" }) }] }
                                }
                            ]
                        }
                    }
                }
                break

            // ==========================================
            // 3. TemplateMessages (Old & Modern)
            // ==========================================
            case "template_moderno":
                msgContent = {
                    templateMessage: {
                        hydratedFourRowTemplate: {
                            hydratedContentText: "Este es un template hidratado",
                            hydratedButtons: [
                                { index: 1, urlButton: { displayText: "Web", url: "https://wa.me" } },
                                { index: 2, callButton: { displayText: "Llamar", phoneNumber: "123" } },
                                { index: 3, quickReplyButton: { displayText: "Hola", id: "hi" } }
                            ]
                        }
                    }
                }
                break

            // ==========================================
            // 4. Protocolo e Interacción Directa
            // ==========================================
            case "protocolo_total":
                await sock.sendMessage(jid, { react: { text: "✅", key: m.key } })
                const s = await sock.sendMessage(jid, { text: "Mensaje base" })
                await Baileys.delay(1000)
                await sock.sendMessage(jid, { edit: s.key, text: "Mensaje editado" })
                await Baileys.delay(1000)
                await sock.sendMessage(jid, { pin: s.key, type: 1 })
                return

            // ==========================================
            // 5. Social, Media y Otros
            // ==========================================
            case "social_full":
                await sock.sendMessage(jid, { poll: { name: "Test", values: ["A", "B"] } })
                msgContent = {
                    eventMessage: { name: "Evento Global", startTime: Math.floor(Date.now()/1000) },
                    stickerPackMessage: { name: "Pack", stickers: [{ url: "https://raw.githubusercontent.com/al-e-devil/Baileys/master/Media/octopus.webp", fileSha256: Buffer.alloc(32), fileEncSha256: Buffer.alloc(32), mediaKey: Buffer.alloc(32), mimetype: "image/webp", height: 512, width: 512, directPath: "dummy", fileLength: 1000 }] },
                    albumMessage: { expectedImageCount: 5 }
                }
                // Nota: Por limitaciones de proto, solo enviamos uno por caso si no es un relay complejo
                break

            case "vcard_full":
                const vcard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Baileys Team\nORG:OSS;\nTEL;type=CELL;waid=123:123\nEND:VCARD'
                await sock.sendMessage(jid, { contacts: { displayName: 'Devs', contacts: [{ vcard }] } })
                return

            case "comercio_full":
                msgContent = {
                    productMessage: { product: { productImage: imageMessage, title: "Bot" }, businessOwnerJid: sock.user?.id },
                    invoiceMessage: { note: "Pago", token: "T1", attachmentType: 1, attachmentMimetype: "application/pdf" }
                }
                break

            case "util_full":
                msgContent = {
                    locationMessage: { degreesLatitude: 0, degreesLongitude: 0, name: "GPS" },
                    scheduledCallCreationMessage: { title: "Daily", callType: 1, scheduledTimestampMs: Date.now() + 60000 }
                }
                break

            default:
                const menu = `*WHATSAPP ABSOLUTE TEST SUITE*

*Meta AI (AIRich):* airich_completo (Tabla, Código, Latex, Mapa, Grid)
*Interactive:* interactive_full (Todos los botones nativos)
*Carousel:* carousel_full (Tarjetas interactivas)
*Templates:* template_moderno (Botones hidratados)
*Protocolo:* protocolo_total (Reacción, Edit, Pin)
*Social:* social_full (Poll, Event, Stickers)
*Contacto:* vcard_full
*Comercio:* comercio_full (Producto, Factura)
*Util:* util_full (Ubicación, Llamada)`
                await sock.sendMessage(jid, { text: menu })
                return
        }

        if (useGenerateWAMessage && msgContent) {
            const msg = await Baileys.generateWAMessageFromContent(jid, { viewOnceMessage: { message: msgContent } }, options)
            await sock.relayMessage(jid, msg.message, { messageId: msg.key.id })
        }
    }
}