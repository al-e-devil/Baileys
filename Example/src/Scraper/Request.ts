import axios, { AxiosInstance } from "axios"
import { CookieJar } from "tough-cookie"
import { wrapper } from "axios-cookiejar-support"
import cloudscraper from "cloudscraper"

export default new class Request {
    public jar: CookieJar
    public cloud: typeof cloudscraper
    public client: AxiosInstance
    public axios: AxiosInstance

    constructor() {
        this.jar = new CookieJar()
        this.cloud = cloudscraper

        this.client = wrapper(axios.create({ jar: this.jar } as any))

        this.axios = wrapper(
            axios.create({
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    Referer: "https://www.google.com/",
                    "Accept-Language": "en-US,en;q=0.9",
                    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                },
                jar: this.jar,
                timeout: 10000,
                maxRedirects: 5,
            } as any)
        )
    }
}()
