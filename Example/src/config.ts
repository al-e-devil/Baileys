import { config as dotenvConfig } from 'dotenv';
dotenvConfig({ path: 'Example/.env' });

import type { Config } from './@Types'

const config: Config = {
    owner: {
        number: process.env.OWNER_NUMBER as string
    },
    bot: {
        name: process.env.BOT_NAME as string,
        author: process.env.BOT_AUTHOR as string,
        version: process.env.BOT_VERSION as string
    },

    mods: process.env.MODS?.split(",") as string[],
    prefix: process.env.PREFIX?.split(",") as string[],
    log: {
        level: process.env.LOG_LEVEL as string
    }
}

export default config
