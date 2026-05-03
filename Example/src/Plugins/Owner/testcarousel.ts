export default {
    name: "testcarousel",
    description: "Envia un mensaje interactivo de prueba con carousel buttons",
    command: ["testcarousel", "testcar", "tc"],
    exec: async (m: any, { sock, Baileys, proto }: { sock: any, Baileys: any, proto: any }) => {
        await sock.sendMessage(m.from, {
            text: 'fox',
            footer: 'aea',
            carousel: [
                {
                    title: 'puta',
                    body: 'Indonesio de mierda',
                    footer: 'aea',
                    image: { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoBjN2nTzp9rlo6ji7_mxsbGTMzfshHwbX229e6ymBvQ&s=10' },
                    buttons: [
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'puta',
                                id: 'aea'
                            })
                        }
                    ]
                },
                {
                    title: 'Indonesian 💩💩💩 ',
                    body: 'burros',
                    footer: 'chchch',
                    image: { url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTByhahZBz5LBXLKF4CgMVf-N5nbl36DD8bqj5-cf3uljPgR8IByR3QYyhd&s=10' },
                    buttons: [
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: 'porno',
                                url: 'https://xnxx.com'
                            })
                        }
                    ]
                }
            ]
        })
    }
}