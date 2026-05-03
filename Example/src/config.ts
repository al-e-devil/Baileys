const config = {
    owner: {
        number: process.env.OWNER_NUMBER
    },
    bot: {
        name: process.env.BOT_NAME,
        author: process.env.BOT_AUTHOR,
        version: process.env.BOT_VERSION
    },
    mods: process.env.MODS.split(","),
    prefix: process.env.PREFIX.split(",")
    log: {
        level: process.env.LOG_LEVEL || "info",
    },
}

export default config
