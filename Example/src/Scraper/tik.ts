import https from "https";
import http from "http";
import zlib from "zlib";
import { IncomingMessage } from "http";
import XBogus from "./xbogus";
import { writeFileSync } from "fs";

export interface DownloadResult {
    status: boolean;
    data?: any;
    error?: string;
}

export interface SearchResult {
    status: boolean;
    error?: string;
    data?: any;
    cursor?: number;
    has_more?: boolean;
}

export default class TikTok {
    private readonly UA_MOBILE = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36";
    private readonly UA_DESKTOP = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";
    private readonly REDIRECTS = [301, 302, 303, 307, 308];
    private readonly HTML_HEADERS: Record<string, string> = {
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": '"Android"',
        "user-agent": this.UA_MOBILE,
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "accept-encoding": "gzip, deflate",
        redirect: "follow"
    };

    private fetchHtml(url: string, extra: Record<string, string> = {}, jar: string[] = []): Promise<{ data: string; cookies: string[]; finalUrl: string }> {
        return new Promise((resolve, reject) => {
            const cookies = [...jar];

            const req = (u: string, depth = 0) => {
                if (depth > 5) return reject(new Error("Too many redirects"));
                const p = new URL(u);
                const lib = p.protocol === "https:" ? https : http;
                const headers = { ...this.HTML_HEADERS, ...extra };
                if (cookies.length) headers["cookie"] = cookies.join("; ");

                lib.get({ hostname: p.hostname, path: p.pathname + p.search, headers, timeout: 20_000 }, (res: IncomingMessage) => {
                    if (res.headers["set-cookie"]) {
                        cookies.push(...res.headers["set-cookie"].map(c => c.split(";")[0]));
                    }
                    if (res.statusCode && this.REDIRECTS.includes(res.statusCode) && res.headers.location) {
                        const loc = res.headers.location;
                        return req(loc.startsWith("http") ? loc : p.origin + loc, depth + 1);
                    }
                    const enc = res.headers["content-encoding"];
                    let stream: NodeJS.ReadableStream = res;
                    if (enc === "gzip") stream = res.pipe(zlib.createGunzip());
                    else if (enc === "deflate") stream = res.pipe(zlib.createInflate());

                    const chunks: Buffer[] = [];
                    stream.on("data", (c: Buffer) => chunks.push(c));
                    stream.on("end", () => resolve({ data: Buffer.concat(chunks).toString(), cookies, finalUrl: u }));
                    stream.on("error", reject);
                }).on("error", reject);
            };

            req(url);
        });
    }

    private fetchJson(url: string, extra: Record<string, string> = {}, cookies = ""): Promise<any> {
        return new Promise((resolve, reject) => {
            const p = new URL(url);
            const headers: Record<string, string> = {
                "user-agent": this.UA_DESKTOP,
                "accept": "*/*",
                "accept-encoding": "gzip, deflate, br",
                "accept-language": "es-ES,es;q=0.9,en;q=0.8",
                "referer": "https://www.tiktok.com/",
                ...extra
            };
            if (cookies) headers["cookie"] = cookies;

            https.get({ hostname: p.hostname, path: p.pathname + p.search, headers, timeout: 15_000 }, (res) => {
                const enc = res.headers["content-encoding"];
                let stream: NodeJS.ReadableStream = res;
                if (enc === "gzip") stream = res.pipe(zlib.createGunzip());
                else if (enc === "br") stream = res.pipe(zlib.createBrotliDecompress());
                else if (enc === "deflate") stream = res.pipe(zlib.createInflate());

                const chunks: Buffer[] = [];
                stream.on("data", (c: Buffer) => chunks.push(c));
                stream.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch { resolve(null); } });
                stream.on("error", reject);
            }).on("error", reject);
        });
    }

    private hydrate(html: string): any {
        let m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
        if (m?.[1]) { try { return JSON.parse(m[1]); } catch { } }

        m = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
        if (m?.[1]) { try { return JSON.parse(m[1]); } catch { } }

        m = html.match(/window\[['"]SIGI_STATE['"]\]\s*=\s*({[\s\S]*?});/);
        if (m?.[1]) { try { return JSON.parse(m[1]); } catch { } }

        return null;
    }

    async download(url: string): Promise<DownloadResult> {
        try {
            const { data: html, cookies, finalUrl } = await this.fetchHtml(url);

            const json = this.hydrate(html);
            if (!json) throw new Error("No TikTok data.");

            const scope = json.__DEFAULT_SCOPE__ || json;
            const detail = scope["webapp.reflow.video.detail"] || scope["webapp.video-detail"] || scope["webapp.ad-detail"] || scope["ItemModule"]?.[Object.keys(scope["ItemModule"] || {})[0]];

            const music = scope["sharing.music.music_state"];
            if (music) {
                const item = music.musicInfo
                return {
                    status: true,
                    data: {
                        id: item.basic.id,
                        title: item.basic.title,
                        media: {
                            type: "sound",
                            duration: item.basic.duration,
                            cover: item.basic.coverLarge ? item.basic.coverLarge : item.basic.coverMedium,
                            play: item.basic.musicPlay.playUrl
                        },
                        stats: {
                            posts: item.stats.videoCount
                        },
                        author: {
                            nickname: item.basic.authorName
                        }
                    }
                }
            }

            const item = detail?.itemInfo?.itemStruct || detail?.itemStruct || detail;

            if (!item || !item.id) {
                const code = detail?.statusCode;
                if (code === 10240) throw new Error("Post privado o restringido (10240).");
                if (code === 10204) throw new Error("Post eliminado.");
                throw new Error(`Post no encontrado (${code ?? "unknown"}).`);
            }

            const a = item.author || {};
            const m = item.music || {};
            const st = item.stats || item.statsV2 || {};

            let media: any;
            if (item.imagePost) {
                const images = (item.imagePost.images || []).flatMap((img: any) => img?.imageURL?.urlList || []).filter(Boolean).map((u: string) => u);
                media = {
                    type: "image",
                    images,
                    image_count: images.length
                };
            } else {
                const player: any = await this.fetchJson(`https://www.tiktok.com/player/api/v1/items?item_ids=${item.id}`);
                const url = player?.items?.[0]?.video_info?.url_list?.[0] || "";
                const v = item.video || {};
                const bitrates: any[] = v.bitRateAll || v.bitrateInfo || [];
                const nowatermark: any = {
                    play: url || v.playAddr
                };
                if (bitrates.length) {
                    const top = [...bitrates].sort((x, y) => (y.BitRate || 0) - (x.BitRate || 0))[0];
                    const getU = (p: any) => p?.UrlList || p?.urlList || p;
                    if (top?.PlayAddr) nowatermark.hd = {
                        play: getU(top.PlayAddr),
                        quality: top.GearName || "hd"
                    };
                }
                media = {
                    type: "video",
                    duration: item.duration || v.duration,
                    resolution: v.width && v.height ? `${v.width}x${v.height}` : undefined,
                    nowatermark,
                    cover: v.cover || v.originCover
                };
            }

            const result: any = {
                id: item.id || item.aweme_id,
                title: item.desc || item.suggestedWords?.[0],
                media,
                creation: item.createTime,
                stats: {
                    views: st.playCount,
                    likes: st.diggCount,
                    comments: st.commentCount,
                    shares: st.shareCount
                },
                author: {
                    id: a.id,
                    unique_id: a.uniqueId,
                    nickname: a.nickname,
                    avatar: a.avatarThumb || a.avatarMedium || a.avatarLarger
                },
                cookies
            };

            if (item.locationCreated) result.location = item.locationCreated;

            if (m.id || m.title) {
                result.music = {
                    id: m.id,
                    title: m.title,
                    author: m.authorName,
                    cover: m.coverLarge || m.coverMedium,
                    play: m.playUrl,
                    ...(m.original !== undefined ? { original: !!m.original } : {})
                };
            }

            return { status: true, data: result };
        } catch (e: any) {
            return {
                status: false,
                error: e.message,
                data: {
                    error: e.message,
                    error_code: e.code,
                    stack: e.stack
                }
            };
        }
    }

    async stalk(username: string): Promise<DownloadResult> {
        try {
            const user = username.replace(/^@/, "");
            const { data: html } = await this.fetchHtml(`https://www.tiktok.com/@${user}`);
            const json = this.hydrate(html);
            if (!json) throw new Error("Rate Limit o formato desconocido.");

            const scope = json.__DEFAULT_SCOPE__ || json;
            let u: any = null, s: any = {};

            const ud = scope["webapp.user-detail"];
            if (ud?.statusCode === 0) {
                u = ud.userInfo?.user;
                s = ud.userInfo?.stats || {};
            }

            if (!u) {
                const usersModule = scope["UserModule"] || scope["UserPage"];
                const users = usersModule?.users || {};
                const stats = usersModule?.stats || {};
                const userKey = Object.keys(users).find(k => users[k].uniqueId === user) || user;

                if (users[userKey]) {
                    u = users[userKey];
                    s = stats[userKey] || {};
                }
            }

            if (!u) throw new Error("Usuario no encontrado.");

            const result: any = {
                id: u.id,
                unique_id: u.uniqueId || user,
                nickname: u.nickname,
                avatar: u.avatarLarger || u.avatarMedium || u.avatarThumb,
                verified: !!u.verified,
                private: !!u.privateAccount,
                stats: {
                    followers: s.followerCount,
                    following: s.followingCount,
                    hearts: s.heart || s.heartCount,
                    videos: s.videoCount
                }
            };
            if (u.signature) result.bio = u.signature;
            if (u.region) result.region = u.region;
            if (u.bioLink?.link) result.bioLink = u.bioLink.link;
            if (u.createTime) result.creation = u.createTime;

            return {
                status: true,
                data: result
            };
        } catch (e: any) {
            return {
                status: false,
                error: e.message,
                data: {
                    error: e.message,
                    error_code: e.code,
                    stack: e.stack
                }
            };
        }
    }

    /** async search(
        query: string,
        type: "video" | "image" | "user" | "top" = "top",
        count = 12
    ): Promise<SearchResult> {
        try {

            if (type === "user") {
                const users = (data.user_list || data.data || []).map((r: any) => {
                    const u = r.user_info || r.userInfo?.user || r;
                    const s = r.stats || r.userInfo?.stats || {};
                    return {
                        id: u.uid || u.id,
                        unique_id: u.unique_id || u.uniqueId,
                        nickname: u.nickname,
                        avatar: u.avatar_thumb?.url_list?.[0] || u.avatarThumb,
                        verified: !!(u.custom_verify || u.verified),
                        stats: {
                            followers: s.follower_count || s.followerCount,
                            videos: s.aweme_count || s.videoCount
                        }
                    };
                });
                return {
                    status: true,
                    data: users,
                    cursor: data.cursor,
                    has_more: !!data.has_more
                };
            }

            const items = (data.data || data.item_list || []).map((r: any) => {
                const item = r.item || r;
                const a = item.author || {};
                const st = item.stats || item.statsV2 || {};
                const isImage = !!(item.imagePost || item.image_post_info);
                const imgs = item.imagePost?.images || item.image_post_info?.images || [];
                const cover = isImage ? (imgs[0]?.imageURL?.urlList?.[0] || imgs[0]?.display_image?.url_list?.[0] || "") : (item.video?.cover || item.video?.originCover);
                return {
                    id: item.id || item.aweme_id,
                    type: isImage ? "image" : "video",
                    title: item.desc,
                    cover,
                    author: {
                        unique_id: a.uniqueId || a.unique_id,
                        nickname: a.nickname
                    },
                    stats: {
                        views: st.playCount || st.play_count,
                        likes: st.diggCount || st.digg_count
                    }
                };
            });

            return {
                status: true,
                data: items
            };

        } catch (e: any) {
            return {
                status: false,
                error: e.message,
                data: {
                    error: e.message,
                    error_code: e.code,
                    stack: e.stack
                }
            };
        }
    } **/

    async hashtag(tag: string, count = 30): Promise<SearchResult> {
        try {
            const tags = tag.replace(/^#/, "");
            const { data: html } = await this.fetchHtml(`https://www.tiktok.com/tag/${tags}`);
            const json = this.hydrate(html);
            if (!json) throw new Error("Rate Limit o formato desconocido.");

            const scope = json.__DEFAULT_SCOPE__ || json;
            const module = scope["ChallengeModule"] || scope["ChallengePage"] || scope["webapp.challenge-detail"] || {};
            const info = module.challengeInfo || module;
            const challenge = info.challenge || {};
            const stats = info.stats || {};

            const items = scope["ItemModule"] || scope["webapp.challenge-item"]?.itemList || {};
            const list = Array.isArray(items) ? items : Object.values(items);

            const videos = list.slice(0, count).map((item: any) => ({
                id: item.id,
                title: item.desc,
                cover: item.video?.cover,
                author: {
                    unique_id: item.author?.uniqueId,
                    nickname: item.author?.nickname
                }
            }));

            const result: any = { videos };
            if (challenge.id) result.hashtag = {
                id: challenge.id,
                title: challenge.title,
                ...(challenge.desc ? { description: challenge.desc } : {}),
                stats: {
                    views: stats.viewCount,
                    videos: stats.videoCount
                }
            };

            return {
                status: true,
                data: [result]
            };
        } catch (e: any) {
            return {
                status: false,
                error: e.message,
                data: {
                    error: e.message,
                    error_code: e.code,
                    stack: e.stack
                }
            };
        }
    }

    async trending(count = 30): Promise<SearchResult> {
        try {
            const { data: html } = await this.fetchHtml("https://www.tiktok.com/explore");
            const json = this.hydrate(html);
            if (!json) throw new Error("Rate Limit o formato desconocido.");

            const scope = json.__DEFAULT_SCOPE__ || json;
            let items: any[] = [];

            for (const key of Object.keys(scope)) {
                if (scope[key]?.itemList?.length) { items = scope[key].itemList; break; }
            }
            if (!items.length && scope.ItemModule) {
                items = Object.values(scope.ItemModule);
            }
            if (!items.length) throw new Error("No se encontraron videos en tendencia.");

            return {
                status: true,
                data: items.slice(0, count).map((item: any) => ({
                    id: item.id,
                    title: item.desc,
                    cover: item.video?.cover,
                    author: {
                        unique_id: item.author?.uniqueId,
                        nickname: item.author?.nickname
                    },
                    stats: {
                        views: (item.stats || item.statsV2)?.playCount,
                        likes: (item.stats || item.statsV2)?.diggCount
                    }
                }))
            };
        } catch (e: any) {
            return {
                status: false,
                error: e.message,
                data: {
                    error: e.message,
                    error_code: e.code,
                    stack: e.stack
                }
            };
        }
    }

    async buffer(url: string, cookies: string[] = []): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const p = new URL(url);
            https.get({
                hostname: p.hostname, path: p.pathname + p.search,
                headers: { "user-agent": this.UA_MOBILE, "referer": "https://www.tiktok.com/", "cookie": cookies.join("; ") }
            }, (res) => {
                const chunks: Buffer[] = [];
                res.on("data", (c: Buffer) => chunks.push(c));
                res.on("end", () => resolve(Buffer.concat(chunks)));
                res.on("error", reject);
            }).on("error", reject);
        });
    }
}