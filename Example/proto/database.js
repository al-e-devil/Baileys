/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import $protobuf from "protobufjs/minimal.js";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});


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
}

export const database = $root.database = (() => {

    /**
     * Namespace database.
     * @exports database
     * @namespace
     */
    const database = {};

    database.User = (function() {

        /**
         * Properties of a User.
         * @memberof database
         * @interface IUser
         * @property {string|null} [email] User email
         * @property {string|null} [passwordHash] User passwordHash
         * @property {boolean|null} [banned] User banned
         * @property {string|null} [name] User name
         * @property {number|null} [age] User age
         * @property {number|Long|null} [createdAt] User createdAt
         * @property {number|Long|null} [updatedAt] User updatedAt
         * @property {number|Long|null} [coins] User coins
         * @property {number|Long|null} [xp] User xp
         * @property {number|null} [level] User level
         * @property {number|null} [warns] User warns
         * @property {string|null} [number] User number
         * @property {string|null} [language] User language
         * @property {string|null} [timezone] User timezone
         * @property {string|null} [country] User country
         * @property {boolean|null} [registered] User registered
         * @property {boolean|null} [blacklist] User blacklist
         */

        /**
         * Constructs a new User.
         * @memberof database
         * @classdesc Represents a User.
         * @implements IUser
         * @constructor
         * @param {database.IUser=} [properties] Properties to set
         */
        function User(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * User email.
         * @member {string} email
         * @memberof database.User
         * @instance
         */
        User.prototype.email = "";

        /**
         * User passwordHash.
         * @member {string} passwordHash
         * @memberof database.User
         * @instance
         */
        User.prototype.passwordHash = "";

        /**
         * User banned.
         * @member {boolean} banned
         * @memberof database.User
         * @instance
         */
        User.prototype.banned = false;

        /**
         * User name.
         * @member {string} name
         * @memberof database.User
         * @instance
         */
        User.prototype.name = "";

        /**
         * User age.
         * @member {number} age
         * @memberof database.User
         * @instance
         */
        User.prototype.age = 0;

        /**
         * User createdAt.
         * @member {number|Long} createdAt
         * @memberof database.User
         * @instance
         */
        User.prototype.createdAt = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * User updatedAt.
         * @member {number|Long} updatedAt
         * @memberof database.User
         * @instance
         */
        User.prototype.updatedAt = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * User coins.
         * @member {number|Long} coins
         * @memberof database.User
         * @instance
         */
        User.prototype.coins = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * User xp.
         * @member {number|Long} xp
         * @memberof database.User
         * @instance
         */
        User.prototype.xp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * User level.
         * @member {number} level
         * @memberof database.User
         * @instance
         */
        User.prototype.level = 0;

        /**
         * User warns.
         * @member {number} warns
         * @memberof database.User
         * @instance
         */
        User.prototype.warns = 0;

        /**
         * User number.
         * @member {string} number
         * @memberof database.User
         * @instance
         */
        User.prototype.number = "";

        /**
         * User language.
         * @member {string} language
         * @memberof database.User
         * @instance
         */
        User.prototype.language = "";

        /**
         * User timezone.
         * @member {string} timezone
         * @memberof database.User
         * @instance
         */
        User.prototype.timezone = "";

        /**
         * User country.
         * @member {string} country
         * @memberof database.User
         * @instance
         */
        User.prototype.country = "";

        /**
         * User registered.
         * @member {boolean} registered
         * @memberof database.User
         * @instance
         */
        User.prototype.registered = false;

        /**
         * User blacklist.
         * @member {boolean} blacklist
         * @memberof database.User
         * @instance
         */
        User.prototype.blacklist = false;

        /**
         * Creates a new User instance using the specified properties.
         * @function create
         * @memberof database.User
         * @static
         * @param {database.IUser=} [properties] Properties to set
         * @returns {database.User} User instance
         */
        User.create = function create(properties) {
            return new User(properties);
        };

        /**
         * Encodes the specified User message. Does not implicitly {@link database.User.verify|verify} messages.
         * @function encode
         * @memberof database.User
         * @static
         * @param {database.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.email != null && Object.hasOwnProperty.call(message, "email"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.email);
            if (message.passwordHash != null && Object.hasOwnProperty.call(message, "passwordHash"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.passwordHash);
            if (message.banned != null && Object.hasOwnProperty.call(message, "banned"))
                writer.uint32(/* id 3, wireType 0 =*/24).bool(message.banned);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.name);
            if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.age);
            if (message.createdAt != null && Object.hasOwnProperty.call(message, "createdAt"))
                writer.uint32(/* id 6, wireType 0 =*/48).int64(message.createdAt);
            if (message.updatedAt != null && Object.hasOwnProperty.call(message, "updatedAt"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.updatedAt);
            if (message.coins != null && Object.hasOwnProperty.call(message, "coins"))
                writer.uint32(/* id 8, wireType 0 =*/64).int64(message.coins);
            if (message.xp != null && Object.hasOwnProperty.call(message, "xp"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.xp);
            if (message.level != null && Object.hasOwnProperty.call(message, "level"))
                writer.uint32(/* id 10, wireType 0 =*/80).int32(message.level);
            if (message.warns != null && Object.hasOwnProperty.call(message, "warns"))
                writer.uint32(/* id 11, wireType 0 =*/88).int32(message.warns);
            if (message.number != null && Object.hasOwnProperty.call(message, "number"))
                writer.uint32(/* id 12, wireType 2 =*/98).string(message.number);
            if (message.language != null && Object.hasOwnProperty.call(message, "language"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.language);
            if (message.timezone != null && Object.hasOwnProperty.call(message, "timezone"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.timezone);
            if (message.country != null && Object.hasOwnProperty.call(message, "country"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.country);
            if (message.registered != null && Object.hasOwnProperty.call(message, "registered"))
                writer.uint32(/* id 16, wireType 0 =*/128).bool(message.registered);
            if (message.blacklist != null && Object.hasOwnProperty.call(message, "blacklist"))
                writer.uint32(/* id 17, wireType 0 =*/136).bool(message.blacklist);
            return writer;
        };

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link database.User.verify|verify} messages.
         * @function encodeDelimited
         * @memberof database.User
         * @static
         * @param {database.IUser} message User message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        User.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a User message from the specified reader or buffer.
         * @function decode
         * @memberof database.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {database.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.User();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.email = reader.string();
                        break;
                    }
                case 2: {
                        message.passwordHash = reader.string();
                        break;
                    }
                case 3: {
                        message.banned = reader.bool();
                        break;
                    }
                case 4: {
                        message.name = reader.string();
                        break;
                    }
                case 5: {
                        message.age = reader.int32();
                        break;
                    }
                case 6: {
                        message.createdAt = reader.int64();
                        break;
                    }
                case 7: {
                        message.updatedAt = reader.int64();
                        break;
                    }
                case 8: {
                        message.coins = reader.int64();
                        break;
                    }
                case 9: {
                        message.xp = reader.int64();
                        break;
                    }
                case 10: {
                        message.level = reader.int32();
                        break;
                    }
                case 11: {
                        message.warns = reader.int32();
                        break;
                    }
                case 12: {
                        message.number = reader.string();
                        break;
                    }
                case 13: {
                        message.language = reader.string();
                        break;
                    }
                case 14: {
                        message.timezone = reader.string();
                        break;
                    }
                case 15: {
                        message.country = reader.string();
                        break;
                    }
                case 16: {
                        message.registered = reader.bool();
                        break;
                    }
                case 17: {
                        message.blacklist = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof database.User
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {database.User} User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        User.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a User message.
         * @function verify
         * @memberof database.User
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        User.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.email != null && message.hasOwnProperty("email"))
                if (!$util.isString(message.email))
                    return "email: string expected";
            if (message.passwordHash != null && message.hasOwnProperty("passwordHash"))
                if (!$util.isString(message.passwordHash))
                    return "passwordHash: string expected";
            if (message.banned != null && message.hasOwnProperty("banned"))
                if (typeof message.banned !== "boolean")
                    return "banned: boolean expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.age != null && message.hasOwnProperty("age"))
                if (!$util.isInteger(message.age))
                    return "age: integer expected";
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (!$util.isInteger(message.createdAt) && !(message.createdAt && $util.isInteger(message.createdAt.low) && $util.isInteger(message.createdAt.high)))
                    return "createdAt: integer|Long expected";
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (!$util.isInteger(message.updatedAt) && !(message.updatedAt && $util.isInteger(message.updatedAt.low) && $util.isInteger(message.updatedAt.high)))
                    return "updatedAt: integer|Long expected";
            if (message.coins != null && message.hasOwnProperty("coins"))
                if (!$util.isInteger(message.coins) && !(message.coins && $util.isInteger(message.coins.low) && $util.isInteger(message.coins.high)))
                    return "coins: integer|Long expected";
            if (message.xp != null && message.hasOwnProperty("xp"))
                if (!$util.isInteger(message.xp) && !(message.xp && $util.isInteger(message.xp.low) && $util.isInteger(message.xp.high)))
                    return "xp: integer|Long expected";
            if (message.level != null && message.hasOwnProperty("level"))
                if (!$util.isInteger(message.level))
                    return "level: integer expected";
            if (message.warns != null && message.hasOwnProperty("warns"))
                if (!$util.isInteger(message.warns))
                    return "warns: integer expected";
            if (message.number != null && message.hasOwnProperty("number"))
                if (!$util.isString(message.number))
                    return "number: string expected";
            if (message.language != null && message.hasOwnProperty("language"))
                if (!$util.isString(message.language))
                    return "language: string expected";
            if (message.timezone != null && message.hasOwnProperty("timezone"))
                if (!$util.isString(message.timezone))
                    return "timezone: string expected";
            if (message.country != null && message.hasOwnProperty("country"))
                if (!$util.isString(message.country))
                    return "country: string expected";
            if (message.registered != null && message.hasOwnProperty("registered"))
                if (typeof message.registered !== "boolean")
                    return "registered: boolean expected";
            if (message.blacklist != null && message.hasOwnProperty("blacklist"))
                if (typeof message.blacklist !== "boolean")
                    return "blacklist: boolean expected";
            return null;
        };

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof database.User
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {database.User} User
         */
        User.fromObject = function fromObject(object, long) {
            if (object instanceof $root.database.User)
                return object;
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.database.User();
            if (object.email != null)
                message.email = String(object.email);
            if (object.passwordHash != null)
                message.passwordHash = String(object.passwordHash);
            if (object.banned != null)
                message.banned = Boolean(object.banned);
            if (object.name != null)
                message.name = String(object.name);
            if (object.age != null)
                message.age = object.age | 0;
            if (object.createdAt != null)
                if ($util.Long)
                    (message.createdAt = $util.Long.fromValue(object.createdAt)).unsigned = false;
                else if (typeof object.createdAt === "string")
                    message.createdAt = parseInt(object.createdAt, 10);
                else if (typeof object.createdAt === "number")
                    message.createdAt = object.createdAt;
                else if (typeof object.createdAt === "object")
                    message.createdAt = new $util.LongBits(object.createdAt.low >>> 0, object.createdAt.high >>> 0).toNumber();
            if (object.updatedAt != null)
                if ($util.Long)
                    (message.updatedAt = $util.Long.fromValue(object.updatedAt)).unsigned = false;
                else if (typeof object.updatedAt === "string")
                    message.updatedAt = parseInt(object.updatedAt, 10);
                else if (typeof object.updatedAt === "number")
                    message.updatedAt = object.updatedAt;
                else if (typeof object.updatedAt === "object")
                    message.updatedAt = new $util.LongBits(object.updatedAt.low >>> 0, object.updatedAt.high >>> 0).toNumber();
            if (object.coins != null)
                if ($util.Long)
                    (message.coins = $util.Long.fromValue(object.coins)).unsigned = false;
                else if (typeof object.coins === "string")
                    message.coins = parseInt(object.coins, 10);
                else if (typeof object.coins === "number")
                    message.coins = object.coins;
                else if (typeof object.coins === "object")
                    message.coins = new $util.LongBits(object.coins.low >>> 0, object.coins.high >>> 0).toNumber();
            if (object.xp != null)
                if ($util.Long)
                    (message.xp = $util.Long.fromValue(object.xp)).unsigned = false;
                else if (typeof object.xp === "string")
                    message.xp = parseInt(object.xp, 10);
                else if (typeof object.xp === "number")
                    message.xp = object.xp;
                else if (typeof object.xp === "object")
                    message.xp = new $util.LongBits(object.xp.low >>> 0, object.xp.high >>> 0).toNumber();
            if (object.level != null)
                message.level = object.level | 0;
            if (object.warns != null)
                message.warns = object.warns | 0;
            if (object.number != null)
                message.number = String(object.number);
            if (object.language != null)
                message.language = String(object.language);
            if (object.timezone != null)
                message.timezone = String(object.timezone);
            if (object.country != null)
                message.country = String(object.country);
            if (object.registered != null)
                message.registered = Boolean(object.registered);
            if (object.blacklist != null)
                message.blacklist = Boolean(object.blacklist);
            return message;
        };

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @function toObject
         * @memberof database.User
         * @static
         * @param {database.User} message User
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        User.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.email = "";
                object.passwordHash = "";
                object.banned = false;
                object.name = "";
                object.age = 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.createdAt = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.createdAt = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.updatedAt = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.updatedAt = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.coins = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.coins = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    let long = new $util.Long(0, 0, false);
                    object.xp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.xp = options.longs === String ? "0" : 0;
                object.level = 0;
                object.warns = 0;
                object.number = "";
                object.language = "";
                object.timezone = "";
                object.country = "";
                object.registered = false;
                object.blacklist = false;
            }
            if (message.email != null && message.hasOwnProperty("email"))
                object.email = message.email;
            if (message.passwordHash != null && message.hasOwnProperty("passwordHash"))
                object.passwordHash = message.passwordHash;
            if (message.banned != null && message.hasOwnProperty("banned"))
                object.banned = message.banned;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.age != null && message.hasOwnProperty("age"))
                object.age = message.age;
            if (message.createdAt != null && message.hasOwnProperty("createdAt"))
                if (typeof message.createdAt === "number")
                    object.createdAt = options.longs === String ? String(message.createdAt) : message.createdAt;
                else
                    object.createdAt = options.longs === String ? longToString(message.createdAt) : options.longs === Number ? longToNumber(message.createdAt) : message.createdAt;
            if (message.updatedAt != null && message.hasOwnProperty("updatedAt"))
                if (typeof message.updatedAt === "number")
                    object.updatedAt = options.longs === String ? String(message.updatedAt) : message.updatedAt;
                else
                    object.updatedAt = options.longs === String ? longToString(message.updatedAt) : options.longs === Number ? longToNumber(message.updatedAt) : message.updatedAt;
            if (message.coins != null && message.hasOwnProperty("coins"))
                if (typeof message.coins === "number")
                    object.coins = options.longs === String ? String(message.coins) : message.coins;
                else
                    object.coins = options.longs === String ? longToString(message.coins) : options.longs === Number ? longToNumber(message.coins) : message.coins;
            if (message.xp != null && message.hasOwnProperty("xp"))
                if (typeof message.xp === "number")
                    object.xp = options.longs === String ? String(message.xp) : message.xp;
                else
                    object.xp = options.longs === String ? longToString(message.xp) : options.longs === Number ? longToNumber(message.xp) : message.xp;
            if (message.level != null && message.hasOwnProperty("level"))
                object.level = message.level;
            if (message.warns != null && message.hasOwnProperty("warns"))
                object.warns = message.warns;
            if (message.number != null && message.hasOwnProperty("number"))
                object.number = message.number;
            if (message.language != null && message.hasOwnProperty("language"))
                object.language = message.language;
            if (message.timezone != null && message.hasOwnProperty("timezone"))
                object.timezone = message.timezone;
            if (message.country != null && message.hasOwnProperty("country"))
                object.country = message.country;
            if (message.registered != null && message.hasOwnProperty("registered"))
                object.registered = message.registered;
            if (message.blacklist != null && message.hasOwnProperty("blacklist"))
                object.blacklist = message.blacklist;
            return object;
        };

        /**
         * Converts this User to JSON.
         * @function toJSON
         * @memberof database.User
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        User.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for User
         * @function getTypeUrl
         * @memberof database.User
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        User.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/database.User";
        };

        return User;
    })();

    database.Notify = (function() {

        /**
         * Properties of a Notify.
         * @memberof database
         * @interface INotify
         * @property {string|null} [message] Notify message
         * @property {boolean|null} [status] Notify status
         */

        /**
         * Constructs a new Notify.
         * @memberof database
         * @classdesc Represents a Notify.
         * @implements INotify
         * @constructor
         * @param {database.INotify=} [properties] Properties to set
         */
        function Notify(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Notify message.
         * @member {string} message
         * @memberof database.Notify
         * @instance
         */
        Notify.prototype.message = "";

        /**
         * Notify status.
         * @member {boolean} status
         * @memberof database.Notify
         * @instance
         */
        Notify.prototype.status = false;

        /**
         * Creates a new Notify instance using the specified properties.
         * @function create
         * @memberof database.Notify
         * @static
         * @param {database.INotify=} [properties] Properties to set
         * @returns {database.Notify} Notify instance
         */
        Notify.create = function create(properties) {
            return new Notify(properties);
        };

        /**
         * Encodes the specified Notify message. Does not implicitly {@link database.Notify.verify|verify} messages.
         * @function encode
         * @memberof database.Notify
         * @static
         * @param {database.INotify} message Notify message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Notify.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.message);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.status);
            return writer;
        };

        /**
         * Encodes the specified Notify message, length delimited. Does not implicitly {@link database.Notify.verify|verify} messages.
         * @function encodeDelimited
         * @memberof database.Notify
         * @static
         * @param {database.INotify} message Notify message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Notify.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Notify message from the specified reader or buffer.
         * @function decode
         * @memberof database.Notify
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {database.Notify} Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Notify.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.Notify();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.message = reader.string();
                        break;
                    }
                case 2: {
                        message.status = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Notify message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof database.Notify
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {database.Notify} Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Notify.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Notify message.
         * @function verify
         * @memberof database.Notify
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Notify.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (typeof message.status !== "boolean")
                    return "status: boolean expected";
            return null;
        };

        /**
         * Creates a Notify message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof database.Notify
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {database.Notify} Notify
         */
        Notify.fromObject = function fromObject(object, long) {
            if (object instanceof $root.database.Notify)
                return object;
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.database.Notify();
            if (object.message != null)
                message.message = String(object.message);
            if (object.status != null)
                message.status = Boolean(object.status);
            return message;
        };

        /**
         * Creates a plain object from a Notify message. Also converts values to other types if specified.
         * @function toObject
         * @memberof database.Notify
         * @static
         * @param {database.Notify} message Notify
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Notify.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.message = "";
                object.status = false;
            }
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            return object;
        };

        /**
         * Converts this Notify to JSON.
         * @function toJSON
         * @memberof database.Notify
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Notify.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Notify
         * @function getTypeUrl
         * @memberof database.Notify
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Notify.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/database.Notify";
        };

        return Notify;
    })();

    database.AntiLink = (function() {

        /**
         * Properties of an AntiLink.
         * @memberof database
         * @interface IAntiLink
         * @property {boolean|null} [status] AntiLink status
         * @property {Object.<string,boolean>|null} [platforms] AntiLink platforms
         */

        /**
         * Constructs a new AntiLink.
         * @memberof database
         * @classdesc Represents an AntiLink.
         * @implements IAntiLink
         * @constructor
         * @param {database.IAntiLink=} [properties] Properties to set
         */
        function AntiLink(properties) {
            this.platforms = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AntiLink status.
         * @member {boolean} status
         * @memberof database.AntiLink
         * @instance
         */
        AntiLink.prototype.status = false;

        /**
         * AntiLink platforms.
         * @member {Object.<string,boolean>} platforms
         * @memberof database.AntiLink
         * @instance
         */
        AntiLink.prototype.platforms = $util.emptyObject;

        /**
         * Creates a new AntiLink instance using the specified properties.
         * @function create
         * @memberof database.AntiLink
         * @static
         * @param {database.IAntiLink=} [properties] Properties to set
         * @returns {database.AntiLink} AntiLink instance
         */
        AntiLink.create = function create(properties) {
            return new AntiLink(properties);
        };

        /**
         * Encodes the specified AntiLink message. Does not implicitly {@link database.AntiLink.verify|verify} messages.
         * @function encode
         * @memberof database.AntiLink
         * @static
         * @param {database.IAntiLink} message AntiLink message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AntiLink.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 1, wireType 0 =*/8).bool(message.status);
            if (message.platforms != null && Object.hasOwnProperty.call(message, "platforms"))
                for (let keys = Object.keys(message.platforms), i = 0; i < keys.length; ++i)
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]).uint32(/* id 2, wireType 0 =*/16).bool(message.platforms[keys[i]]).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AntiLink message, length delimited. Does not implicitly {@link database.AntiLink.verify|verify} messages.
         * @function encodeDelimited
         * @memberof database.AntiLink
         * @static
         * @param {database.IAntiLink} message AntiLink message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AntiLink.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AntiLink message from the specified reader or buffer.
         * @function decode
         * @memberof database.AntiLink
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {database.AntiLink} AntiLink
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AntiLink.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.AntiLink(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.status = reader.bool();
                        break;
                    }
                case 2: {
                        if (message.platforms === $util.emptyObject)
                            message.platforms = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = false;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = reader.bool();
                                break;
                            default:
                                reader.skipType(tag2 & 7, long);
                                break;
                            }
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.platforms, key);
                        message.platforms[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AntiLink message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof database.AntiLink
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {database.AntiLink} AntiLink
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AntiLink.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AntiLink message.
         * @function verify
         * @memberof database.AntiLink
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AntiLink.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.status != null && message.hasOwnProperty("status"))
                if (typeof message.status !== "boolean")
                    return "status: boolean expected";
            if (message.platforms != null && message.hasOwnProperty("platforms")) {
                if (!$util.isObject(message.platforms))
                    return "platforms: object expected";
                let key = Object.keys(message.platforms);
                for (let i = 0; i < key.length; ++i)
                    if (typeof message.platforms[key[i]] !== "boolean")
                        return "platforms: boolean{k:string} expected";
            }
            return null;
        };

        /**
         * Creates an AntiLink message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof database.AntiLink
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {database.AntiLink} AntiLink
         */
        AntiLink.fromObject = function fromObject(object, long) {
            if (object instanceof $root.database.AntiLink)
                return object;
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.database.AntiLink();
            if (object.status != null)
                message.status = Boolean(object.status);
            if (object.platforms) {
                if (typeof object.platforms !== "object")
                    throw TypeError(".database.AntiLink.platforms: object expected");
                message.platforms = {};
                for (let keys = Object.keys(object.platforms), i = 0; i < keys.length; ++i) {
                    if (keys[i] === "__proto__")
                        $util.makeProp(message.platforms, keys[i]);
                    message.platforms[keys[i]] = Boolean(object.platforms[keys[i]]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from an AntiLink message. Also converts values to other types if specified.
         * @function toObject
         * @memberof database.AntiLink
         * @static
         * @param {database.AntiLink} message AntiLink
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AntiLink.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.platforms = {};
            if (options.defaults)
                object.status = false;
            if (message.status != null && message.hasOwnProperty("status"))
                object.status = message.status;
            let keys2;
            if (message.platforms && (keys2 = Object.keys(message.platforms)).length) {
                object.platforms = {};
                for (let j = 0; j < keys2.length; ++j) {
                    if (keys2[j] === "__proto__")
                        $util.makeProp(object.platforms, keys2[j]);
                    object.platforms[keys2[j]] = message.platforms[keys2[j]];
                }
            }
            return object;
        };

        /**
         * Converts this AntiLink to JSON.
         * @function toJSON
         * @memberof database.AntiLink
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AntiLink.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for AntiLink
         * @function getTypeUrl
         * @memberof database.AntiLink
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        AntiLink.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/database.AntiLink";
        };

        return AntiLink;
    })();

    database.Group = (function() {

        /**
         * Properties of a Group.
         * @memberof database
         * @interface IGroup
         * @property {string|null} [prefix] Group prefix
         * @property {string|null} [welcome] Group welcome
         * @property {string|null} [bye] Group bye
         * @property {boolean|null} [mute] Group mute
         * @property {boolean|null} [welcomeEnabled] Group welcomeEnabled
         * @property {string|null} [name] Group name
         * @property {string|null} [code] Group code
         * @property {database.IAntiLink|null} [antilink] Group antilink
         * @property {boolean|null} [antiporn] Group antiporn
         * @property {boolean|null} [antionce] Group antionce
         * @property {boolean|null} [antifake] Group antifake
         * @property {boolean|null} [antitoxic] Group antitoxic
         * @property {boolean|null} [antidelete] Group antidelete
         * @property {Object.<string,database.INotify>|null} [notifications] Group notifications
         */

        /**
         * Constructs a new Group.
         * @memberof database
         * @classdesc Represents a Group.
         * @implements IGroup
         * @constructor
         * @param {database.IGroup=} [properties] Properties to set
         */
        function Group(properties) {
            this.notifications = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Group prefix.
         * @member {string} prefix
         * @memberof database.Group
         * @instance
         */
        Group.prototype.prefix = "";

        /**
         * Group welcome.
         * @member {string} welcome
         * @memberof database.Group
         * @instance
         */
        Group.prototype.welcome = "";

        /**
         * Group bye.
         * @member {string} bye
         * @memberof database.Group
         * @instance
         */
        Group.prototype.bye = "";

        /**
         * Group mute.
         * @member {boolean} mute
         * @memberof database.Group
         * @instance
         */
        Group.prototype.mute = false;

        /**
         * Group welcomeEnabled.
         * @member {boolean} welcomeEnabled
         * @memberof database.Group
         * @instance
         */
        Group.prototype.welcomeEnabled = false;

        /**
         * Group name.
         * @member {string} name
         * @memberof database.Group
         * @instance
         */
        Group.prototype.name = "";

        /**
         * Group code.
         * @member {string} code
         * @memberof database.Group
         * @instance
         */
        Group.prototype.code = "";

        /**
         * Group antilink.
         * @member {database.IAntiLink|null|undefined} antilink
         * @memberof database.Group
         * @instance
         */
        Group.prototype.antilink = null;

        /**
         * Group antiporn.
         * @member {boolean} antiporn
         * @memberof database.Group
         * @instance
         */
        Group.prototype.antiporn = false;

        /**
         * Group antionce.
         * @member {boolean} antionce
         * @memberof database.Group
         * @instance
         */
        Group.prototype.antionce = false;

        /**
         * Group antifake.
         * @member {boolean} antifake
         * @memberof database.Group
         * @instance
         */
        Group.prototype.antifake = false;

        /**
         * Group antitoxic.
         * @member {boolean} antitoxic
         * @memberof database.Group
         * @instance
         */
        Group.prototype.antitoxic = false;

        /**
         * Group antidelete.
         * @member {boolean} antidelete
         * @memberof database.Group
         * @instance
         */
        Group.prototype.antidelete = false;

        /**
         * Group notifications.
         * @member {Object.<string,database.INotify>} notifications
         * @memberof database.Group
         * @instance
         */
        Group.prototype.notifications = $util.emptyObject;

        /**
         * Creates a new Group instance using the specified properties.
         * @function create
         * @memberof database.Group
         * @static
         * @param {database.IGroup=} [properties] Properties to set
         * @returns {database.Group} Group instance
         */
        Group.create = function create(properties) {
            return new Group(properties);
        };

        /**
         * Encodes the specified Group message. Does not implicitly {@link database.Group.verify|verify} messages.
         * @function encode
         * @memberof database.Group
         * @static
         * @param {database.IGroup} message Group message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Group.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.prefix != null && Object.hasOwnProperty.call(message, "prefix"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.prefix);
            if (message.welcome != null && Object.hasOwnProperty.call(message, "welcome"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.welcome);
            if (message.bye != null && Object.hasOwnProperty.call(message, "bye"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.bye);
            if (message.mute != null && Object.hasOwnProperty.call(message, "mute"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.mute);
            if (message.welcomeEnabled != null && Object.hasOwnProperty.call(message, "welcomeEnabled"))
                writer.uint32(/* id 5, wireType 0 =*/40).bool(message.welcomeEnabled);
            if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.name);
            if (message.code != null && Object.hasOwnProperty.call(message, "code"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.code);
            if (message.antilink != null && Object.hasOwnProperty.call(message, "antilink"))
                $root.database.AntiLink.encode(message.antilink, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            if (message.antiporn != null && Object.hasOwnProperty.call(message, "antiporn"))
                writer.uint32(/* id 9, wireType 0 =*/72).bool(message.antiporn);
            if (message.antionce != null && Object.hasOwnProperty.call(message, "antionce"))
                writer.uint32(/* id 10, wireType 0 =*/80).bool(message.antionce);
            if (message.antifake != null && Object.hasOwnProperty.call(message, "antifake"))
                writer.uint32(/* id 11, wireType 0 =*/88).bool(message.antifake);
            if (message.antitoxic != null && Object.hasOwnProperty.call(message, "antitoxic"))
                writer.uint32(/* id 12, wireType 0 =*/96).bool(message.antitoxic);
            if (message.antidelete != null && Object.hasOwnProperty.call(message, "antidelete"))
                writer.uint32(/* id 13, wireType 0 =*/104).bool(message.antidelete);
            if (message.notifications != null && Object.hasOwnProperty.call(message, "notifications"))
                for (let keys = Object.keys(message.notifications), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 14, wireType 2 =*/114).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.database.Notify.encode(message.notifications[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified Group message, length delimited. Does not implicitly {@link database.Group.verify|verify} messages.
         * @function encodeDelimited
         * @memberof database.Group
         * @static
         * @param {database.IGroup} message Group message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Group.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Group message from the specified reader or buffer.
         * @function decode
         * @memberof database.Group
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {database.Group} Group
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Group.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.Group(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.prefix = reader.string();
                        break;
                    }
                case 2: {
                        message.welcome = reader.string();
                        break;
                    }
                case 3: {
                        message.bye = reader.string();
                        break;
                    }
                case 4: {
                        message.mute = reader.bool();
                        break;
                    }
                case 5: {
                        message.welcomeEnabled = reader.bool();
                        break;
                    }
                case 6: {
                        message.name = reader.string();
                        break;
                    }
                case 7: {
                        message.code = reader.string();
                        break;
                    }
                case 8: {
                        message.antilink = $root.database.AntiLink.decode(reader, reader.uint32(), undefined, long + 1);
                        break;
                    }
                case 9: {
                        message.antiporn = reader.bool();
                        break;
                    }
                case 10: {
                        message.antionce = reader.bool();
                        break;
                    }
                case 11: {
                        message.antifake = reader.bool();
                        break;
                    }
                case 12: {
                        message.antitoxic = reader.bool();
                        break;
                    }
                case 13: {
                        message.antidelete = reader.bool();
                        break;
                    }
                case 14: {
                        if (message.notifications === $util.emptyObject)
                            message.notifications = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.database.Notify.decode(reader, reader.uint32(), undefined, long + 1);
                                break;
                            default:
                                reader.skipType(tag2 & 7, long);
                                break;
                            }
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.notifications, key);
                        message.notifications[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Group message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof database.Group
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {database.Group} Group
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Group.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Group message.
         * @function verify
         * @memberof database.Group
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Group.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.prefix != null && message.hasOwnProperty("prefix"))
                if (!$util.isString(message.prefix))
                    return "prefix: string expected";
            if (message.welcome != null && message.hasOwnProperty("welcome"))
                if (!$util.isString(message.welcome))
                    return "welcome: string expected";
            if (message.bye != null && message.hasOwnProperty("bye"))
                if (!$util.isString(message.bye))
                    return "bye: string expected";
            if (message.mute != null && message.hasOwnProperty("mute"))
                if (typeof message.mute !== "boolean")
                    return "mute: boolean expected";
            if (message.welcomeEnabled != null && message.hasOwnProperty("welcomeEnabled"))
                if (typeof message.welcomeEnabled !== "boolean")
                    return "welcomeEnabled: boolean expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.code != null && message.hasOwnProperty("code"))
                if (!$util.isString(message.code))
                    return "code: string expected";
            if (message.antilink != null && message.hasOwnProperty("antilink")) {
                let error = $root.database.AntiLink.verify(message.antilink, long + 1);
                if (error)
                    return "antilink." + error;
            }
            if (message.antiporn != null && message.hasOwnProperty("antiporn"))
                if (typeof message.antiporn !== "boolean")
                    return "antiporn: boolean expected";
            if (message.antionce != null && message.hasOwnProperty("antionce"))
                if (typeof message.antionce !== "boolean")
                    return "antionce: boolean expected";
            if (message.antifake != null && message.hasOwnProperty("antifake"))
                if (typeof message.antifake !== "boolean")
                    return "antifake: boolean expected";
            if (message.antitoxic != null && message.hasOwnProperty("antitoxic"))
                if (typeof message.antitoxic !== "boolean")
                    return "antitoxic: boolean expected";
            if (message.antidelete != null && message.hasOwnProperty("antidelete"))
                if (typeof message.antidelete !== "boolean")
                    return "antidelete: boolean expected";
            if (message.notifications != null && message.hasOwnProperty("notifications")) {
                if (!$util.isObject(message.notifications))
                    return "notifications: object expected";
                let key = Object.keys(message.notifications);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.database.Notify.verify(message.notifications[key[i]], long + 1);
                    if (error)
                        return "notifications." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Group message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof database.Group
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {database.Group} Group
         */
        Group.fromObject = function fromObject(object, long) {
            if (object instanceof $root.database.Group)
                return object;
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.database.Group();
            if (object.prefix != null)
                message.prefix = String(object.prefix);
            if (object.welcome != null)
                message.welcome = String(object.welcome);
            if (object.bye != null)
                message.bye = String(object.bye);
            if (object.mute != null)
                message.mute = Boolean(object.mute);
            if (object.welcomeEnabled != null)
                message.welcomeEnabled = Boolean(object.welcomeEnabled);
            if (object.name != null)
                message.name = String(object.name);
            if (object.code != null)
                message.code = String(object.code);
            if (object.antilink != null) {
                if (typeof object.antilink !== "object")
                    throw TypeError(".database.Group.antilink: object expected");
                message.antilink = $root.database.AntiLink.fromObject(object.antilink, long + 1);
            }
            if (object.antiporn != null)
                message.antiporn = Boolean(object.antiporn);
            if (object.antionce != null)
                message.antionce = Boolean(object.antionce);
            if (object.antifake != null)
                message.antifake = Boolean(object.antifake);
            if (object.antitoxic != null)
                message.antitoxic = Boolean(object.antitoxic);
            if (object.antidelete != null)
                message.antidelete = Boolean(object.antidelete);
            if (object.notifications) {
                if (typeof object.notifications !== "object")
                    throw TypeError(".database.Group.notifications: object expected");
                message.notifications = {};
                for (let keys = Object.keys(object.notifications), i = 0; i < keys.length; ++i) {
                    if (keys[i] === "__proto__")
                        $util.makeProp(message.notifications, keys[i]);
                    if (typeof object.notifications[keys[i]] !== "object")
                        throw TypeError(".database.Group.notifications: object expected");
                    message.notifications[keys[i]] = $root.database.Notify.fromObject(object.notifications[keys[i]], long + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Group message. Also converts values to other types if specified.
         * @function toObject
         * @memberof database.Group
         * @static
         * @param {database.Group} message Group
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Group.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults)
                object.notifications = {};
            if (options.defaults) {
                object.prefix = "";
                object.welcome = "";
                object.bye = "";
                object.mute = false;
                object.welcomeEnabled = false;
                object.name = "";
                object.code = "";
                object.antilink = null;
                object.antiporn = false;
                object.antionce = false;
                object.antifake = false;
                object.antitoxic = false;
                object.antidelete = false;
            }
            if (message.prefix != null && message.hasOwnProperty("prefix"))
                object.prefix = message.prefix;
            if (message.welcome != null && message.hasOwnProperty("welcome"))
                object.welcome = message.welcome;
            if (message.bye != null && message.hasOwnProperty("bye"))
                object.bye = message.bye;
            if (message.mute != null && message.hasOwnProperty("mute"))
                object.mute = message.mute;
            if (message.welcomeEnabled != null && message.hasOwnProperty("welcomeEnabled"))
                object.welcomeEnabled = message.welcomeEnabled;
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.code != null && message.hasOwnProperty("code"))
                object.code = message.code;
            if (message.antilink != null && message.hasOwnProperty("antilink"))
                object.antilink = $root.database.AntiLink.toObject(message.antilink, options);
            if (message.antiporn != null && message.hasOwnProperty("antiporn"))
                object.antiporn = message.antiporn;
            if (message.antionce != null && message.hasOwnProperty("antionce"))
                object.antionce = message.antionce;
            if (message.antifake != null && message.hasOwnProperty("antifake"))
                object.antifake = message.antifake;
            if (message.antitoxic != null && message.hasOwnProperty("antitoxic"))
                object.antitoxic = message.antitoxic;
            if (message.antidelete != null && message.hasOwnProperty("antidelete"))
                object.antidelete = message.antidelete;
            let keys2;
            if (message.notifications && (keys2 = Object.keys(message.notifications)).length) {
                object.notifications = {};
                for (let j = 0; j < keys2.length; ++j) {
                    if (keys2[j] === "__proto__")
                        $util.makeProp(object.notifications, keys2[j]);
                    object.notifications[keys2[j]] = $root.database.Notify.toObject(message.notifications[keys2[j]], options);
                }
            }
            return object;
        };

        /**
         * Converts this Group to JSON.
         * @function toJSON
         * @memberof database.Group
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Group.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Group
         * @function getTypeUrl
         * @memberof database.Group
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Group.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/database.Group";
        };

        return Group;
    })();

    database.Collection = (function() {

        /**
         * Properties of a Collection.
         * @memberof database
         * @interface ICollection
         * @property {Object.<string,database.IUser>|null} [users] Collection users
         * @property {Object.<string,database.IGroup>|null} [groups] Collection groups
         */

        /**
         * Constructs a new Collection.
         * @memberof database
         * @classdesc Represents a Collection.
         * @implements ICollection
         * @constructor
         * @param {database.ICollection=} [properties] Properties to set
         */
        function Collection(properties) {
            this.users = {};
            this.groups = {};
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null && keys[i] !== "__proto__")
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Collection users.
         * @member {Object.<string,database.IUser>} users
         * @memberof database.Collection
         * @instance
         */
        Collection.prototype.users = $util.emptyObject;

        /**
         * Collection groups.
         * @member {Object.<string,database.IGroup>} groups
         * @memberof database.Collection
         * @instance
         */
        Collection.prototype.groups = $util.emptyObject;

        /**
         * Creates a new Collection instance using the specified properties.
         * @function create
         * @memberof database.Collection
         * @static
         * @param {database.ICollection=} [properties] Properties to set
         * @returns {database.Collection} Collection instance
         */
        Collection.create = function create(properties) {
            return new Collection(properties);
        };

        /**
         * Encodes the specified Collection message. Does not implicitly {@link database.Collection.verify|verify} messages.
         * @function encode
         * @memberof database.Collection
         * @static
         * @param {database.ICollection} message Collection message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Collection.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.users != null && Object.hasOwnProperty.call(message, "users"))
                for (let keys = Object.keys(message.users), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.database.User.encode(message.users[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            if (message.groups != null && Object.hasOwnProperty.call(message, "groups"))
                for (let keys = Object.keys(message.groups), i = 0; i < keys.length; ++i) {
                    writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                    $root.database.Group.encode(message.groups[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                }
            return writer;
        };

        /**
         * Encodes the specified Collection message, length delimited. Does not implicitly {@link database.Collection.verify|verify} messages.
         * @function encodeDelimited
         * @memberof database.Collection
         * @static
         * @param {database.ICollection} message Collection message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Collection.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Collection message from the specified reader or buffer.
         * @function decode
         * @memberof database.Collection
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {database.Collection} Collection
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Collection.decode = function decode(reader, length, error, long) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            if (long === undefined)
                long = 0;
            if (long > $Reader.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.Collection(), key, value;
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        if (message.users === $util.emptyObject)
                            message.users = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.database.User.decode(reader, reader.uint32(), undefined, long + 1);
                                break;
                            default:
                                reader.skipType(tag2 & 7, long);
                                break;
                            }
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.users, key);
                        message.users[key] = value;
                        break;
                    }
                case 2: {
                        if (message.groups === $util.emptyObject)
                            message.groups = {};
                        let end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            let tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.database.Group.decode(reader, reader.uint32(), undefined, long + 1);
                                break;
                            default:
                                reader.skipType(tag2 & 7, long);
                                break;
                            }
                        }
                        if (key === "__proto__")
                            $util.makeProp(message.groups, key);
                        message.groups[key] = value;
                        break;
                    }
                default:
                    reader.skipType(tag & 7, long);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Collection message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof database.Collection
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {database.Collection} Collection
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Collection.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Collection message.
         * @function verify
         * @memberof database.Collection
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Collection.verify = function verify(message, long) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                return "maximum nesting depth exceeded";
            if (message.users != null && message.hasOwnProperty("users")) {
                if (!$util.isObject(message.users))
                    return "users: object expected";
                let key = Object.keys(message.users);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.database.User.verify(message.users[key[i]], long + 1);
                    if (error)
                        return "users." + error;
                }
            }
            if (message.groups != null && message.hasOwnProperty("groups")) {
                if (!$util.isObject(message.groups))
                    return "groups: object expected";
                let key = Object.keys(message.groups);
                for (let i = 0; i < key.length; ++i) {
                    let error = $root.database.Group.verify(message.groups[key[i]], long + 1);
                    if (error)
                        return "groups." + error;
                }
            }
            return null;
        };

        /**
         * Creates a Collection message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof database.Collection
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {database.Collection} Collection
         */
        Collection.fromObject = function fromObject(object, long) {
            if (object instanceof $root.database.Collection)
                return object;
            if (long === undefined)
                long = 0;
            if (long > $util.recursionLimit)
                throw Error("maximum nesting depth exceeded");
            let message = new $root.database.Collection();
            if (object.users) {
                if (typeof object.users !== "object")
                    throw TypeError(".database.Collection.users: object expected");
                message.users = {};
                for (let keys = Object.keys(object.users), i = 0; i < keys.length; ++i) {
                    if (keys[i] === "__proto__")
                        $util.makeProp(message.users, keys[i]);
                    if (typeof object.users[keys[i]] !== "object")
                        throw TypeError(".database.Collection.users: object expected");
                    message.users[keys[i]] = $root.database.User.fromObject(object.users[keys[i]], long + 1);
                }
            }
            if (object.groups) {
                if (typeof object.groups !== "object")
                    throw TypeError(".database.Collection.groups: object expected");
                message.groups = {};
                for (let keys = Object.keys(object.groups), i = 0; i < keys.length; ++i) {
                    if (keys[i] === "__proto__")
                        $util.makeProp(message.groups, keys[i]);
                    if (typeof object.groups[keys[i]] !== "object")
                        throw TypeError(".database.Collection.groups: object expected");
                    message.groups[keys[i]] = $root.database.Group.fromObject(object.groups[keys[i]], long + 1);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a Collection message. Also converts values to other types if specified.
         * @function toObject
         * @memberof database.Collection
         * @static
         * @param {database.Collection} message Collection
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Collection.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.objects || options.defaults) {
                object.users = {};
                object.groups = {};
            }
            let keys2;
            if (message.users && (keys2 = Object.keys(message.users)).length) {
                object.users = {};
                for (let j = 0; j < keys2.length; ++j) {
                    if (keys2[j] === "__proto__")
                        $util.makeProp(object.users, keys2[j]);
                    object.users[keys2[j]] = $root.database.User.toObject(message.users[keys2[j]], options);
                }
            }
            if (message.groups && (keys2 = Object.keys(message.groups)).length) {
                object.groups = {};
                for (let j = 0; j < keys2.length; ++j) {
                    if (keys2[j] === "__proto__")
                        $util.makeProp(object.groups, keys2[j]);
                    object.groups[keys2[j]] = $root.database.Group.toObject(message.groups[keys2[j]], options);
                }
            }
            return object;
        };

        /**
         * Converts this Collection to JSON.
         * @function toJSON
         * @memberof database.Collection
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Collection.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Collection
         * @function getTypeUrl
         * @memberof database.Collection
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Collection.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/database.Collection";
        };

        return Collection;
    })();

    return database;
})();

export { $root as default };
