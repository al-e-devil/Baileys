import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import type { Plugin } from "../@Types";
import logger from "../Utils/logger";

export default new class Plugins {
    public plugins: Plugin[] = [];

    constructor(
        private folder = path.resolve(__dirname, "..", "Plugins"),
        private filter = (f: string) => /\.(js|ts)$/.test(f) && !f.endsWith(".d.ts")
    ) { }

    async load(): Promise<void> {
        if (!fs.existsSync(this.folder)) fs.mkdirSync(this.folder, { recursive: true });
        this.plugins = [];
        await this.loadFromDir(this.folder);
    }

    private async loadFromDir(dir: string): Promise<void> {
        for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) await this.loadFromDir(fullPath);
            else if (file.isFile() && this.filter(file.name)) {
                try {
                    const { default: p } = await import(pathToFileURL(fullPath).href);
                    if (p?.name && (p?.exec || p?.start)) {
                        this.plugins.push({ disable: false, path: fullPath, ...p });
                        logger.info(`Plugin ${p.name} loaded successfully`);
                    }
                } catch (e: any) {
                    logger.error(`Error loading plugin ${file.name} type error ${e.message}`);
                }
            }
        }
    }
}