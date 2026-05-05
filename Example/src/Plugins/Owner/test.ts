export default {
    name: "test",
    description: "implementación absoluta y experimental de mensajes de whatsapp",
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
        let useGenerateWAMessage = true
        let relayOptions: any = {}
        let options: any = { userJid: sock.user?.id, quoted: m }

        switch (type) {
            case "whiteboard":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        header: { title: "🎨 Collaborative Whiteboard", hasMediaAttachment: false },
                        body: { text: "Dibuja junto a otros en tiempo real (Experimental)" },
                        footer: { text: "Future Feature • Baileys" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "whiteboard",
                                buttonParamsJson: JSON.stringify({
                                    whiteboard_version: "1",
                                    session_id: "WB_" + Date.now(),
                                    display_text: "✏️ Abrir Pizarra",
                                    whiteboard_config: {
                                        canvas_size: { width: 800, height: 600 },
                                        tools: ["pen", "eraser", "shapes", "text", "image"],
                                        colors: ["#000000", "#FF0000", "#00FF00", "#0000FF"],
                                        max_participants: 10,
                                        enable_voice_chat: true,
                                        save_format: "png"
                                    }
                                })
                            }]
                        }
                    })
                }
                break

            case "sheet":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: { text: "Prueba de Bottom Sheet y Tap Target" },
                        header: { 
                            title: "Menu Avanzado", 
                            subtitle: "Configuración Especial", 
                            hasMediaAttachment: true, 
                            imageMessage 
                        },
                        nativeFlowMessage: {
                            messageParamsJson: JSON.stringify({
                                bottom_sheet: {
                                    in_thread_buttons_limit: 2,
                                    divider_indices: [1, 2, 3],
                                    list_title: "Selecciona una categoría",
                                    button_title: "🧾 Ver Opciones"
                                },
                                tap_target_configuration: {
                                    title: "Enlace Directo",
                                    description: "Click para ir a la web",
                                    canonical_url: "https://github.com",
                                    domain: "github.com",
                                    button_index: 0
                                }
                            }),
                            buttons: [
                                { name: "single_select", buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }) },
                                { name: "call_permission_request", buttonParamsJson: JSON.stringify({ has_multiple_buttons: true }) },
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Ver Todo", id: ".all" }) }
                            ]
                        }
                    })
                }
                relayOptions = {
                    additionalNodes: [{
                        tag: "biz",
                        attrs: {},
                        content: [{
                            tag: "interactive",
                            attrs: { type: "native_flow", v: "1" },
                            content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }]
                        }]
                    }]
                }
                break

            // ==========================================
            // 2. META AI & REELS (AIRichResponseMessage)
            // ==========================================
            case "reels":
                const reelItems = [
                    { title: "Video 1", profileIconUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", videoUrl: "https://www.instagram.com/reels/" },
                    { title: "Video 2", profileIconUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", videoUrl: "https://www.instagram.com/reels/" }
                ];
                
                const unifiedResponseData = {
                    response_id: "res-" + Date.now(),
                    sections: [
                        { view_model: { primitive: { text: "Mira estos Reels interesantes", __typename: "GenAIMarkdownTextUXPrimitive" }, __typename: "GenAISingleLayoutViewModel" } },
                        {
                            view_model: {
                                primitives: reelItems.map(item => ({
                                    reels_url: item.videoUrl,
                                    thumbnail_url: item.thumbnailUrl,
                                    creator: item.title,
                                    avatar_url: item.profileIconUrl,
                                    reel_source: "IG",
                                    is_verified: true,
                                    __typename: "GenAIReelPrimitive"
                                })),
                                __typename: "GenAIHScrollLayoutViewModel"
                            }
                        }
                    ]
                };

                msgContent = {
                    messageContextInfo: {
                        deviceListMetadata: {}, deviceListMetadataVersion: 2,
                        botMetadata: {
                            richResponseSourcesMetadata: {
                                sources: reelItems.map((item, i) => ({ provider: "IG", sourceProviderURL: item.videoUrl, citationNumber: i + 1, sourceTitle: item.title }))
                            }
                        }
                    },
                    botForwardedMessage: {
                        message: {
                            richResponseMessage: {
                                messageType: 1,
                                submessages: [
                                    { messageType: 2, messageText: "Contenido de Reels sugerido" },
                                    {
                                        messageType: 9, // CONTENT_ITEMS
                                        contentItemsMetadata: {
                                            contentType: 1,
                                            itemsMetadata: reelItems.map(item => ({ reelItem: item }))
                                        }
                                    }
                                ],
                                unifiedResponse: {
                                    data: Buffer.from(JSON.stringify(unifiedResponseData))
                                },
                                contextInfo: { 
                                    isForwarded: true, 
                                    forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" } 
                                }
                            }
                        }
                    }
                }
                break
            case "story":
                let temp: any = {
                    groupStatusMessageV2: {
                        message: { conversation: "¡Este es un estado de grupo (Story) forzado!" }
                    }
                };
                for (let i = 0; i < 5; i++) {
                    temp = { groupStatusMessageV2: { message: temp } };
                }
                msgContent = temp;
                break
            case "carousel":
                msgContent = {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: { text: "Demo Carrusel" },
                        carouselMessage: {
                            cards: [
                                {
                                    body: { text: "Card 1" },
                                    header: { title: "Enlace", hasMediaAttachment: true, imageMessage },
                                    nativeFlowMessage: { buttons: [{ name: "cta_url", buttonParamsJson: JSON.stringify({ display_text: "Ir", url: "https://google.com" }) }] }
                                }
                            ]
                        }
                    })
                }
                break

            case "botones":
                msgContent = {
                    interactiveMessage: {
                        body: { text: "Botones Nativa" },
                        nativeFlowMessage: {
                            buttons: [
                                { name: "quick_reply", buttonParamsJson: JSON.stringify({ display_text: "Ping", id: ".ping" }) },
                                { name: "cta_copy", buttonParamsJson: JSON.stringify({ display_text: "Copiar", copy_code: "123" }) }
                            ]
                        }
                    }
                }
                break

            case "lista":
                msgContent = {
                    interactiveMessage: {
                        body: { text: "Lista Nativa" },
                        nativeFlowMessage: {
                            buttons: [{
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    title: "Menu",
                                    sections: [{ title: "S", rows: [{ title: "Op 1", id: "1" }] }]
                                })
                            }]
                        }
                    }
                }
                break
            case "encuesta":
                await sock.sendMessage(jid, { poll: { name: "Test", values: ["A", "B"] } })
                return

            case "airich_full":
                msgContent = {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            { messageType: 2, messageText: "Tablas y Código IA" },
                            { messageType: 4, tableMetadata: { title: "Test", rows: [{ items: ["A", "B"], isHeading: true }] } },
                            { messageType: 5, codeMetadata: { codeLanguage: "js", codeBlocks: [{ codeContent: "console.log('hi')" }] } }
                        ]
                    }
                }
                break

            case "lottie":
                const { stickerMessage } = await Baileys.prepareWAMessageMedia({ sticker: { url: "https://raw.githubusercontent.com/al-e-devil/Baileys/master/Media/octopus.webp" } }, { upload: sock.waUploadToServer })
                if (stickerMessage) stickerMessage.isLottie = true
                msgContent = { stickerMessage }
                break

            case "album":
                msgContent = { albumMessage: { expectedImageCount: 2 } }
                break

            case "factura":
                msgContent = { invoiceMessage: { note: "Factura", token: "T1", attachmentType: 1, attachmentMimetype: "application/pdf" } }
                break
            case "bcall":
                msgContent = {
                    bcallMessage: {
                        sessionId: "BCALL_" + Date.now(),
                        mediaType: 1, // AUDIO
                        masterKey: Buffer.alloc(32),
                        caption: "Llamada de transmisión"
                    }
                }
                break

            case "payment_invite":
                msgContent = {
                    paymentInviteMessage: {
                        serviceType: 3, // UPI
                        expiryTimestamp: Math.floor(Date.now() / 1000) + 86400
                    }
                }
                break

            case "request_phone":
                msgContent = { requestPhoneNumberMessage: { contextInfo: {} } }
                break

            case "payment_request":
                msgContent = {
                    requestPaymentMessage: {
                        currencyCodeIso4217: "USD",
                        amount1000: 10000,
                        requestFrom: "12345@s.whatsapp.net",
                        expiryTimestamp: Math.floor(Date.now() / 1000) + 86400
                    }
                }
                break

            case "status_qa":
                msgContent = {
                    statusQuestionAnswerMessage: {
                        key: m.key,
                        text: "Respondiendo a tu pregunta en el estado..."
                    }
                }
                break

            case "status_sticker":
                msgContent = {
                    statusStickerInteractionMessage: {
                        key: m.key,
                        stickerKey: "STICKER_123",
                        type: 1 // REACTION
                    }
                }
                break

            case "status_notify":
                msgContent = {
                    statusNotificationMessage: {
                        responseMessageKey: m.key,
                        originalMessageKey: m.key,
                        type: 1 // STATUS_ADD_YOURS
                    }
                }
                break

            default:
                const menu = `*WHATSAPP ULTIMATE EXPERIMENTAL TEST*

*Experimental (New):*
- whiteboard (Collab drawing)
- sheet (Advanced Bottom Sheet + Tap Target)
- reels (IG Reels + Unified Response Data)
- story (Group Story 5x Nested)

*Interactive & Flow:*
- carousel | botones | lista
- airich_full (Tables/Code)
- lottie (Animated Sticker)
- album (Photo bundle)

*Social & Commerce:*
- encuesta | evento
- producto | tienda | factura

*Esoteric & Status (New):*
- bcall (Broadcast Call)
- payment_invite | payment_request
- request_phone
- status_qa | status_sticker | status_notify

*Protocolo:*
- reaccion | editar | borrar | fijar | mantener`
                await sock.sendMessage(jid, { text: menu })
                return
        }

        if (useGenerateWAMessage && msgContent) {
            const msg = await Baileys.generateWAMessageFromContent(jid, msgContent, options)
            await sock.relayMessage(jid, msg.message, { messageId: msg.key.id, ...relayOptions })
        }
    }
}