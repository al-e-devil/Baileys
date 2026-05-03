export default {
    name: "Menu",
    description: "Carga el menú de comandos",
    command: ["menu"],
    exec: async (m: any, { sock }: { sock: any }) => {
        sock.sendMessage(m.from, {
            text: "Comandos disponibles:\n- @menu\n- @info"
        })
    }
}