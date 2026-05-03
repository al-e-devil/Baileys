import TikTok from "../../Scraper/tik";
import config from "../../config";

function makeTikTok(): TikTok {
    return new TikTok();
}

export default {
    name: "TikTok",
    description: "Descarga/busca contenido de TikTok",
    command: ["tiktok", "tt", "musically"],
    exec: async (m: any, { sock }: { sock: any }) => {
        try {
            let q = (m.args ? m.args.join(" ") : (m.text || m.body || "")).trim();
            if (q.split(" ")[0].startsWith(m.prefix || "")) {
                q = q.split(" ").slice(1).join(" ").trim();
            }
            if (!q) return sock.sendMessage(m.from, { text: JSON.stringify({ status: false, error: "Missing argument" }) }, { quoted: m });

            const tt = makeTikTok();
            const urlMatch = q.match(/https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i);
            let res: any;

            if (urlMatch) {
                res = await tt.download(urlMatch[0]);
            } else {
                // Extraer flag
                const FLAGS = ["--user", "--stalk", "--trending", "--hashtag"];
                let flag = "";
                for (const f of FLAGS) {
                    if (q.includes(f)) { flag = f; q = q.replace(f, "").trim(); break; }
                }

                if (flag === "--trending") {
                    res = await tt.trending(10);
                } else if (!q && flag !== "--trending") {
                    return sock.sendMessage(m.from, { text: JSON.stringify({ status: false, error: "Missing query" }) }, { quoted: m });
                } else if (flag === "--stalk" || flag === "--user") {
                    res = await tt.stalk(q);
                } else if (flag === "--hashtag") {
                    res = await tt.hashtag(q, 10);
                } /**else if (flag === "--video") {
                    res = await tt.search(q, "video", 8);
                } else if (flag === "--image") {
                    res = await tt.search(q, "image", 8);
                } else if (flag === "--users") {
                    res = await tt.search(q, "user", 8);
                } else {
                    res = await tt.search(q, "top", 8);
                } **/
            }

            await sock.sendMessage(m.from, { text: JSON.stringify(res, null, 2) }, { quoted: m });
        } catch (e: any) {
            await sock.sendMessage(m.from, { text: JSON.stringify({ status: false, error: e.message }) }, { quoted: m });
        }
    }
}