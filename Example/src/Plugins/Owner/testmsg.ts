export default {
    name: "TestInteractive",
    description: "Envia un mensaje interactivo de prueba con nativeFlow buttons",
    command: ["testmsg", "testi"],
    exec: async (m: any, { sock, Baileys, proto }: { sock: any, Baileys: any, proto: any }) => {
        const msg = Baileys.generateWAMessageFromContent(
            m.from,
            {
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: "tes"
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        title: "Menu List",
                        subtitle: "Single Select",
                        hasMediaAttachment: true,
                        imageMessage: (await Baileys.prepareWAMessageMedia(
                            { image: { url: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg" } },
                            { upload: (sock as any).waUploadToServer }
                        )).imageMessage
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        messageParamsJson: JSON.stringify({
                            bottom_sheet: {
                                in_thread_buttons_limit: 2,
                                divider_indices: [1, 2, 3, 4, 5, 999],
                                list_title: "Silahkan pilih category yang ingin dilihat",
                                button_title: "🧾 Tap Here!"
                            },
                            tap_target_configuration: {
                                title: " X ",
                                description: "bomboclard",
                                canonical_url: "https://ourin.site",
                                domain: "shop.example.com",
                                button_index: 0
                            }
                        }),
                        buttons: [
                            {
                                name: "single_select",
                                buttonParamsJson: JSON.stringify({
                                    has_multiple_buttons: true
                                })
                            },
                            {
                                name: "call_permission_request",
                                buttonParamsJson: JSON.stringify({
                                    has_multiple_buttons: true
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "Lihat Semua Menu",
                                    id: ".allmenu"
                                })
                            }
                        ]
                    })
                })
            },
            { quoted: m, userJid: sock.user?.id }
        )

        await sock.relayMessage(msg.key.remoteJid!, msg.message!, {
            messageId: msg.key.id!,
            additionalNodes: [
                {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            tag: "interactive",
                            attrs: { type: "native_flow", v: "1" },
                            content: [
                                {
                                    tag: "native_flow",
                                    attrs: { v: "9", name: "mixed" }
                                }
                            ]
                        }
                    ]
                }
            ]
        })
    }
}
