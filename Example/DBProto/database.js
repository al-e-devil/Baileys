/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.database = (function() {
    
        /**
         * Namespace database.
         * @exports database
         * @namespace
         */
        var database = {};
    
        database.user = (function() {
    
            /**
             * Properties of a user.
             * @memberof database
             * @interface Iuser
             * @property {string|null} [name] user name
             * @property {boolean|null} [banned] user banned
             * @property {number|null} [age] user age
             */
    
            /**
             * Constructs a new user.
             * @memberof database
             * @classdesc Represents a user.
             * @implements Iuser
             * @constructor
             * @param {database.Iuser=} [properties] Properties to set
             */
            function user(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * user name.
             * @member {string} name
             * @memberof database.user
             * @instance
             */
            user.prototype.name = "";
    
            /**
             * user banned.
             * @member {boolean} banned
             * @memberof database.user
             * @instance
             */
            user.prototype.banned = false;
    
            /**
             * user age.
             * @member {number} age
             * @memberof database.user
             * @instance
             */
            user.prototype.age = 0;
    
            /**
             * Creates a new user instance using the specified properties.
             * @function create
             * @memberof database.user
             * @static
             * @param {database.Iuser=} [properties] Properties to set
             * @returns {database.user} user instance
             */
            user.create = function create(properties) {
                return new user(properties);
            };
    
            /**
             * Encodes the specified user message. Does not implicitly {@link database.user.verify|verify} messages.
             * @function encode
             * @memberof database.user
             * @static
             * @param {database.Iuser} message user message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            user.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.name != null && Object.hasOwnProperty.call(message, "name"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
                if (message.banned != null && Object.hasOwnProperty.call(message, "banned"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.banned);
                if (message.age != null && Object.hasOwnProperty.call(message, "age"))
                    writer.uint32(/* id 3, wireType 0 =*/24).int32(message.age);
                return writer;
            };
    
            /**
             * Encodes the specified user message, length delimited. Does not implicitly {@link database.user.verify|verify} messages.
             * @function encodeDelimited
             * @memberof database.user
             * @static
             * @param {database.Iuser} message user message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            user.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a user message from the specified reader or buffer.
             * @function decode
             * @memberof database.user
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {database.user} user
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            user.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.user();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.name = reader.string();
                        break;
                    case 2:
                        message.banned = reader.bool();
                        break;
                    case 3:
                        message.age = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a user message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof database.user
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {database.user} user
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            user.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a user message.
             * @function verify
             * @memberof database.user
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            user.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.name != null && message.hasOwnProperty("name"))
                    if (!$util.isString(message.name))
                        return "name: string expected";
                if (message.banned != null && message.hasOwnProperty("banned"))
                    if (typeof message.banned !== "boolean")
                        return "banned: boolean expected";
                if (message.age != null && message.hasOwnProperty("age"))
                    if (!$util.isInteger(message.age))
                        return "age: integer expected";
                return null;
            };
    
            /**
             * Creates a user message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof database.user
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {database.user} user
             */
            user.fromObject = function fromObject(object) {
                if (object instanceof $root.database.user)
                    return object;
                var message = new $root.database.user();
                if (object.name != null)
                    message.name = String(object.name);
                if (object.banned != null)
                    message.banned = Boolean(object.banned);
                if (object.age != null)
                    message.age = object.age | 0;
                return message;
            };
    
            /**
             * Creates a plain object from a user message. Also converts values to other types if specified.
             * @function toObject
             * @memberof database.user
             * @static
             * @param {database.user} message user
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            user.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.name = "";
                    object.banned = false;
                    object.age = 0;
                }
                if (message.name != null && message.hasOwnProperty("name"))
                    object.name = message.name;
                if (message.banned != null && message.hasOwnProperty("banned"))
                    object.banned = message.banned;
                if (message.age != null && message.hasOwnProperty("age"))
                    object.age = message.age;
                return object;
            };
    
            /**
             * Converts this user to JSON.
             * @function toJSON
             * @memberof database.user
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            user.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return user;
        })();
    
        database.chat = (function() {
    
            /**
             * Properties of a chat.
             * @memberof database
             * @interface Ichat
             * @property {boolean|null} [banned] chat banned
             * @property {boolean|null} [welcome] chat welcome
             */
    
            /**
             * Constructs a new chat.
             * @memberof database
             * @classdesc Represents a chat.
             * @implements Ichat
             * @constructor
             * @param {database.Ichat=} [properties] Properties to set
             */
            function chat(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * chat banned.
             * @member {boolean} banned
             * @memberof database.chat
             * @instance
             */
            chat.prototype.banned = false;
    
            /**
             * chat welcome.
             * @member {boolean} welcome
             * @memberof database.chat
             * @instance
             */
            chat.prototype.welcome = false;
    
            /**
             * Creates a new chat instance using the specified properties.
             * @function create
             * @memberof database.chat
             * @static
             * @param {database.Ichat=} [properties] Properties to set
             * @returns {database.chat} chat instance
             */
            chat.create = function create(properties) {
                return new chat(properties);
            };
    
            /**
             * Encodes the specified chat message. Does not implicitly {@link database.chat.verify|verify} messages.
             * @function encode
             * @memberof database.chat
             * @static
             * @param {database.Ichat} message chat message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            chat.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.banned != null && Object.hasOwnProperty.call(message, "banned"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.banned);
                if (message.welcome != null && Object.hasOwnProperty.call(message, "welcome"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.welcome);
                return writer;
            };
    
            /**
             * Encodes the specified chat message, length delimited. Does not implicitly {@link database.chat.verify|verify} messages.
             * @function encodeDelimited
             * @memberof database.chat
             * @static
             * @param {database.Ichat} message chat message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            chat.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a chat message from the specified reader or buffer.
             * @function decode
             * @memberof database.chat
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {database.chat} chat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            chat.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.chat();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.banned = reader.bool();
                        break;
                    case 2:
                        message.welcome = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a chat message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof database.chat
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {database.chat} chat
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            chat.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a chat message.
             * @function verify
             * @memberof database.chat
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            chat.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.banned != null && message.hasOwnProperty("banned"))
                    if (typeof message.banned !== "boolean")
                        return "banned: boolean expected";
                if (message.welcome != null && message.hasOwnProperty("welcome"))
                    if (typeof message.welcome !== "boolean")
                        return "welcome: boolean expected";
                return null;
            };
    
            /**
             * Creates a chat message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof database.chat
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {database.chat} chat
             */
            chat.fromObject = function fromObject(object) {
                if (object instanceof $root.database.chat)
                    return object;
                var message = new $root.database.chat();
                if (object.banned != null)
                    message.banned = Boolean(object.banned);
                if (object.welcome != null)
                    message.welcome = Boolean(object.welcome);
                return message;
            };
    
            /**
             * Creates a plain object from a chat message. Also converts values to other types if specified.
             * @function toObject
             * @memberof database.chat
             * @static
             * @param {database.chat} message chat
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            chat.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.banned = false;
                    object.welcome = false;
                }
                if (message.banned != null && message.hasOwnProperty("banned"))
                    object.banned = message.banned;
                if (message.welcome != null && message.hasOwnProperty("welcome"))
                    object.welcome = message.welcome;
                return object;
            };
    
            /**
             * Converts this chat to JSON.
             * @function toJSON
             * @memberof database.chat
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            chat.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return chat;
        })();
    
        database.config = (function() {
    
            /**
             * Properties of a config.
             * @memberof database
             * @interface Iconfig
             * @property {boolean|null} [autoRead] config autoRead
             */
    
            /**
             * Constructs a new config.
             * @memberof database
             * @classdesc Represents a config.
             * @implements Iconfig
             * @constructor
             * @param {database.Iconfig=} [properties] Properties to set
             */
            function config(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * config autoRead.
             * @member {boolean} autoRead
             * @memberof database.config
             * @instance
             */
            config.prototype.autoRead = false;
    
            /**
             * Creates a new config instance using the specified properties.
             * @function create
             * @memberof database.config
             * @static
             * @param {database.Iconfig=} [properties] Properties to set
             * @returns {database.config} config instance
             */
            config.create = function create(properties) {
                return new config(properties);
            };
    
            /**
             * Encodes the specified config message. Does not implicitly {@link database.config.verify|verify} messages.
             * @function encode
             * @memberof database.config
             * @static
             * @param {database.Iconfig} message config message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            config.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.autoRead != null && Object.hasOwnProperty.call(message, "autoRead"))
                    writer.uint32(/* id 1, wireType 0 =*/8).bool(message.autoRead);
                return writer;
            };
    
            /**
             * Encodes the specified config message, length delimited. Does not implicitly {@link database.config.verify|verify} messages.
             * @function encodeDelimited
             * @memberof database.config
             * @static
             * @param {database.Iconfig} message config message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            config.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a config message from the specified reader or buffer.
             * @function decode
             * @memberof database.config
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {database.config} config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            config.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.config();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.autoRead = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a config message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof database.config
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {database.config} config
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            config.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a config message.
             * @function verify
             * @memberof database.config
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            config.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.autoRead != null && message.hasOwnProperty("autoRead"))
                    if (typeof message.autoRead !== "boolean")
                        return "autoRead: boolean expected";
                return null;
            };
    
            /**
             * Creates a config message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof database.config
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {database.config} config
             */
            config.fromObject = function fromObject(object) {
                if (object instanceof $root.database.config)
                    return object;
                var message = new $root.database.config();
                if (object.autoRead != null)
                    message.autoRead = Boolean(object.autoRead);
                return message;
            };
    
            /**
             * Creates a plain object from a config message. Also converts values to other types if specified.
             * @function toObject
             * @memberof database.config
             * @static
             * @param {database.config} message config
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            config.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.autoRead = false;
                if (message.autoRead != null && message.hasOwnProperty("autoRead"))
                    object.autoRead = message.autoRead;
                return object;
            };
    
            /**
             * Converts this config to JSON.
             * @function toJSON
             * @memberof database.config
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            config.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return config;
        })();
    
        database.collection = (function() {
    
            /**
             * Properties of a collection.
             * @memberof database
             * @interface Icollection
             * @property {Object.<string,database.Iuser>|null} [users] collection users
             * @property {Object.<string,database.Ichat>|null} [chats] collection chats
             * @property {Object.<string,database.Iconfig>|null} [settings] collection settings
             */
    
            /**
             * Constructs a new collection.
             * @memberof database
             * @classdesc Represents a collection.
             * @implements Icollection
             * @constructor
             * @param {database.Icollection=} [properties] Properties to set
             */
            function collection(properties) {
                this.users = {};
                this.chats = {};
                this.settings = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * collection users.
             * @member {Object.<string,database.Iuser>} users
             * @memberof database.collection
             * @instance
             */
            collection.prototype.users = $util.emptyObject;
    
            /**
             * collection chats.
             * @member {Object.<string,database.Ichat>} chats
             * @memberof database.collection
             * @instance
             */
            collection.prototype.chats = $util.emptyObject;
    
            /**
             * collection settings.
             * @member {Object.<string,database.Iconfig>} settings
             * @memberof database.collection
             * @instance
             */
            collection.prototype.settings = $util.emptyObject;
    
            /**
             * Creates a new collection instance using the specified properties.
             * @function create
             * @memberof database.collection
             * @static
             * @param {database.Icollection=} [properties] Properties to set
             * @returns {database.collection} collection instance
             */
            collection.create = function create(properties) {
                return new collection(properties);
            };
    
            /**
             * Encodes the specified collection message. Does not implicitly {@link database.collection.verify|verify} messages.
             * @function encode
             * @memberof database.collection
             * @static
             * @param {database.Icollection} message collection message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            collection.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.users != null && Object.hasOwnProperty.call(message, "users"))
                    for (var keys = Object.keys(message.users), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.database.user.encode(message.users[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.chats != null && Object.hasOwnProperty.call(message, "chats"))
                    for (var keys = Object.keys(message.chats), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.database.chat.encode(message.chats[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.settings != null && Object.hasOwnProperty.call(message, "settings"))
                    for (var keys = Object.keys(message.settings), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                        $root.database.config.encode(message.settings[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                return writer;
            };
    
            /**
             * Encodes the specified collection message, length delimited. Does not implicitly {@link database.collection.verify|verify} messages.
             * @function encodeDelimited
             * @memberof database.collection
             * @static
             * @param {database.Icollection} message collection message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            collection.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a collection message from the specified reader or buffer.
             * @function decode
             * @memberof database.collection
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {database.collection} collection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            collection.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.database.collection(), key, value;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (message.users === $util.emptyObject)
                            message.users = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            var tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.database.user.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.users[key] = value;
                        break;
                    case 2:
                        if (message.chats === $util.emptyObject)
                            message.chats = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            var tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.database.chat.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.chats[key] = value;
                        break;
                    case 3:
                        if (message.settings === $util.emptyObject)
                            message.settings = {};
                        var end2 = reader.uint32() + reader.pos;
                        key = "";
                        value = null;
                        while (reader.pos < end2) {
                            var tag2 = reader.uint32();
                            switch (tag2 >>> 3) {
                            case 1:
                                key = reader.string();
                                break;
                            case 2:
                                value = $root.database.config.decode(reader, reader.uint32());
                                break;
                            default:
                                reader.skipType(tag2 & 7);
                                break;
                            }
                        }
                        message.settings[key] = value;
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a collection message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof database.collection
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {database.collection} collection
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            collection.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a collection message.
             * @function verify
             * @memberof database.collection
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            collection.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.users != null && message.hasOwnProperty("users")) {
                    if (!$util.isObject(message.users))
                        return "users: object expected";
                    var key = Object.keys(message.users);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.database.user.verify(message.users[key[i]]);
                        if (error)
                            return "users." + error;
                    }
                }
                if (message.chats != null && message.hasOwnProperty("chats")) {
                    if (!$util.isObject(message.chats))
                        return "chats: object expected";
                    var key = Object.keys(message.chats);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.database.chat.verify(message.chats[key[i]]);
                        if (error)
                            return "chats." + error;
                    }
                }
                if (message.settings != null && message.hasOwnProperty("settings")) {
                    if (!$util.isObject(message.settings))
                        return "settings: object expected";
                    var key = Object.keys(message.settings);
                    for (var i = 0; i < key.length; ++i) {
                        var error = $root.database.config.verify(message.settings[key[i]]);
                        if (error)
                            return "settings." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a collection message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof database.collection
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {database.collection} collection
             */
            collection.fromObject = function fromObject(object) {
                if (object instanceof $root.database.collection)
                    return object;
                var message = new $root.database.collection();
                if (object.users) {
                    if (typeof object.users !== "object")
                        throw TypeError(".database.collection.users: object expected");
                    message.users = {};
                    for (var keys = Object.keys(object.users), i = 0; i < keys.length; ++i) {
                        if (typeof object.users[keys[i]] !== "object")
                            throw TypeError(".database.collection.users: object expected");
                        message.users[keys[i]] = $root.database.user.fromObject(object.users[keys[i]]);
                    }
                }
                if (object.chats) {
                    if (typeof object.chats !== "object")
                        throw TypeError(".database.collection.chats: object expected");
                    message.chats = {};
                    for (var keys = Object.keys(object.chats), i = 0; i < keys.length; ++i) {
                        if (typeof object.chats[keys[i]] !== "object")
                            throw TypeError(".database.collection.chats: object expected");
                        message.chats[keys[i]] = $root.database.chat.fromObject(object.chats[keys[i]]);
                    }
                }
                if (object.settings) {
                    if (typeof object.settings !== "object")
                        throw TypeError(".database.collection.settings: object expected");
                    message.settings = {};
                    for (var keys = Object.keys(object.settings), i = 0; i < keys.length; ++i) {
                        if (typeof object.settings[keys[i]] !== "object")
                            throw TypeError(".database.collection.settings: object expected");
                        message.settings[keys[i]] = $root.database.config.fromObject(object.settings[keys[i]]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a collection message. Also converts values to other types if specified.
             * @function toObject
             * @memberof database.collection
             * @static
             * @param {database.collection} message collection
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            collection.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults) {
                    object.users = {};
                    object.chats = {};
                    object.settings = {};
                }
                var keys2;
                if (message.users && (keys2 = Object.keys(message.users)).length) {
                    object.users = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.users[keys2[j]] = $root.database.user.toObject(message.users[keys2[j]], options);
                }
                if (message.chats && (keys2 = Object.keys(message.chats)).length) {
                    object.chats = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.chats[keys2[j]] = $root.database.chat.toObject(message.chats[keys2[j]], options);
                }
                if (message.settings && (keys2 = Object.keys(message.settings)).length) {
                    object.settings = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.settings[keys2[j]] = $root.database.config.toObject(message.settings[keys2[j]], options);
                }
                return object;
            };
    
            /**
             * Converts this collection to JSON.
             * @function toJSON
             * @memberof database.collection
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            collection.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return collection;
        })();
    
        return database;
    })();

    return $root;
});
