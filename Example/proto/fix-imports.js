import { readFileSync, writeFileSync } from 'fs';

const filePath = './Example/proto/database.js';

try {
    let content = readFileSync(filePath, 'utf8');

    // Fix imports for ESM compatibility
    content = content.replace(/import \* as (\$protobuf) from/g, 'import $1 from');
    content = content.replace(/(['"])protobufjs\/minimal(['"])/g, '$1protobufjs/minimal.js$2');

    // Inject Long optimization helpers (optimized BigInt conversion)
    const marker = 'const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});\n\n';
    const helpers = `
function longToString(value, unsigned) {
    if (value && typeof value.low === "number" && typeof value.high === "number") {
        const combined = (BigInt(value.high >>> 0) << 32n) | BigInt(value.low >>> 0);
        return (!unsigned && value.high < 0) ? (combined - (1n << 64n)).toString() : combined.toString();
    }
    return String(value);
}

function longToNumber(value, unsigned) {
    if (value && typeof value.low === "number" && typeof value.high === "number") {
        const combined = (BigInt(value.high >>> 0) << 32n) | BigInt(value.low >>> 0);
        return (!unsigned && value.high < 0) ? Number(combined - (1n << 64n)) : Number(combined);
    }
    return Number(value);
}\n\n`;

    if (!content.includes('function longToString(')) {
        content = content.replace(marker, marker + helpers);
    }

    // Apply Long optimization pattern
    const longPattern = /([ \t]+object\.(\w+) = )options\.longs === String \? \$util\.Long\.prototype\.toString\.call\(message\.\2\) : options\.longs === Number \? new \$util\.LongBits\(message\.\2\.low >>> 0, message\.\2\.high >>> 0\)\.toNumber\((true)?\) : message\.\2;/g;
    content = content.replace(longPattern, (_, prefix, field, unsigned) => {
        const arg = unsigned ? ', true' : '';
        return `${prefix}options.longs === String ? longToString(message.${field}${arg}) : options.longs === Number ? longToNumber(message.${field}${arg}) : message.${field};`;
    });

    writeFileSync(filePath, content);
    console.log(`Fixed and optimized imports in ${filePath}`);
} catch (error) {
    console.error(`Error fixing imports: ${error.message}`);
    process.exit(1);
}
