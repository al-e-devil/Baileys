import { format } from "util";
import syntaxErr from "syntax-error";
import * as Baileys from "baileys"

export default {
    name: "Eval",
    description: "Evaluate command test code",
    command: /^[_]/i,
    isOwner: true,
    exec: async (m: any, { sock, db, r }: { sock: any, db: any, r: any }) => {
        let _syntax = ""
        let _return;
        
        const context = {
            Baileys,
            proto: Baileys.proto,
            
            sock,
            m,
            db,
            request: r,
            r,
            
            console,
            JSON,
            Math,
            Date,
            Object,
            Array,
            String,
            Number,
            Boolean,
            Promise,
            Error,
            RegExp,
            Map,
            Set,
            setTimeout,
            clearTimeout,
            setInterval,
            clearInterval,
            
            format,
            inspect: (obj: any) => require("util").inspect(obj, { depth: null, colors: true }),
            require
        }
                
        const _filter = Object.fromEntries(
            Object.entries(context).filter(([key]) => !new Set(['default']).has(key))
        )

        const keys = Object.keys(_filter)
        const values = Object.values(_filter)

        let _text = /await|return/gi.test(m.body) ? `(async () => { ${m.body.slice(1)} })()` : `return (${m.body.slice(1)})`
        try {
            const fn = new Function(...keys, _text)
            _return = fn(...values)

            if (_return instanceof Promise) {
                _return = await _return
            }
        } catch (e) {
            let err = await syntaxErr(_text, "Sistema De Ejecución")
            if (err) _syntax = err + "\n\n"
            _return = e instanceof Error ? e.message : e
        } finally {
            await sock.sendMessage(m.from, { text: _syntax + format(_return) })
        }
    }
}