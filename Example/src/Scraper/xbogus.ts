import md5 from "md5";

const HEX_TABLE: number[] = new Array(256).fill(0);
for (let i = 48; i <= 57; i++) HEX_TABLE[i] = i - 48;
for (let i = 97; i <= 102; i++) HEX_TABLE[i] = i - 87;

const XB_ALPHABET = "Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe=";

export default new class XBogus {

    public get(query: string, userAgent: string): string {
        const uaHash = this.md5UserAgent(userAgent);
        const EMPTY_HASH = this.xbHexToBytes(md5(this.xbHexToBytes("d41d8cd98f00b204e9800998ecf8427e")));
        const queryHash = this.xbDoubleHash(query);
        const ts = Math.floor(Date.now() / 1e3);
        const MAGIC = 0x4A41279F;

        const payload = [
            0x40, 0x00, 0x01, 0x0E,
            queryHash[14], queryHash[15],
            EMPTY_HASH[14], EMPTY_HASH[15],
            uaHash[14], uaHash[15],
            (ts >> 24) & 255, (ts >> 16) & 255, (ts >> 8) & 255, ts & 255,
            (MAGIC >> 24) & 255, (MAGIC >> 16) & 255, (MAGIC >> 8) & 255, MAGIC & 255,
        ];
        payload.push(payload.reduce((a, b) => a ^ b, 0)); // XOR checksum

        const evens = payload.filter((_, i) => i % 2 === 0);
        const odds = payload.filter((_, i) => i % 2 !== 0);
        const merged = [...evens, ...odds].slice(0, 19);

        const perm = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15, 16, 17, 18];
        const w = new Uint8Array(19);
        merged.forEach((v, i) => { w[perm[i]] = v; });

        const raw = String.fromCharCode(...w);
        const encrypted = String.fromCharCode(2, 255) + this.xbRC4('\xFF', raw);

        let result = "";
        for (let i = 0; i < encrypted.length;) {
            result += this.xbEncode(
                encrypted.charCodeAt(i++),
                encrypted.charCodeAt(i++),
                encrypted.charCodeAt(i++)
            );
        }

        return result;
    }

    // --- Métodos Privados ---

    private md5UserAgent(userAgent: string): number[] {
        const UA_RC4_KEY = String.fromCharCode(0x00, 0x01, 0x0E);
        const encrypted = this.xbRC4(UA_RC4_KEY, userAgent);
        // Base64 encode seguro para Node.js
        const b64 = Buffer.from(encrypted, 'binary').toString('base64');
        return this.xbHexToBytes(md5(b64));
    }

    private xbHexToBytes(hex: string): number[] {
        const out: number[] = [];
        for (let i = 0; i < hex.length; i += 2)
            out.push((HEX_TABLE[hex.charCodeAt(i)] << 4) | HEX_TABLE[hex.charCodeAt(i + 1)]);
        return out;
    }

    private xbDoubleHash(input: any): number[] {
        return this.xbHexToBytes(md5(this.xbHexToBytes(md5(input))));
    }

    private xbRC4(key: string, data: string): string {
        const S = Array.from({ length: 256 }, (_, i) => i);
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + S[i] + key.charCodeAt(i % key.length)) % 256;
            [S[i], S[j]] = [S[j], S[i]];
        }
        let out = "", a = 0, t = 0;
        for (let k = 0; k < data.length; k++) {
            a = (a + 1) % 256;
            t = (t + S[a]) % 256;
            [S[a], S[t]] = [S[t], S[a]];
            out += String.fromCharCode(data.charCodeAt(k) ^ S[(S[a] + S[t]) % 256]);
        }
        return out;
    }

    private xbEncode(a: number, b: number, c: number): string {
        const r = ((a & 255) << 16) | ((b & 255) << 8) | c;
        return XB_ALPHABET[(r >> 18) & 63] + XB_ALPHABET[(r >> 12) & 63]
            + XB_ALPHABET[(r >> 6) & 63] + XB_ALPHABET[r & 63];
    }
}