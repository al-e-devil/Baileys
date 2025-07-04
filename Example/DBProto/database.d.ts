import * as $protobuf from "protobufjs";
/** Namespace database. */
export namespace database {

    /** Properties of a user. */
    interface Iuser {

        /** user name */
        name?: (string|null);

        /** user banned */
        banned?: (boolean|null);

        /** user age */
        age?: (number|null);
    }

    /** Represents a user. */
    class user implements Iuser {

        /**
         * Constructs a new user.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.Iuser);

        /** user name. */
        public name: string;

        /** user banned. */
        public banned: boolean;

        /** user age. */
        public age: number;

        /**
         * Creates a new user instance using the specified properties.
         * @param [properties] Properties to set
         * @returns user instance
         */
        public static create(properties?: database.Iuser): database.user;

        /**
         * Encodes the specified user message. Does not implicitly {@link database.user.verify|verify} messages.
         * @param message user message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.Iuser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified user message, length delimited. Does not implicitly {@link database.user.verify|verify} messages.
         * @param message user message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.Iuser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a user message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns user
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.user;

        /**
         * Decodes a user message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns user
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.user;

        /**
         * Verifies a user message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a user message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns user
         */
        public static fromObject(object: { [k: string]: any }): database.user;

        /**
         * Creates a plain object from a user message. Also converts values to other types if specified.
         * @param message user
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.user, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this user to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a chat. */
    interface Ichat {

        /** chat banned */
        banned?: (boolean|null);

        /** chat welcome */
        welcome?: (boolean|null);
    }

    /** Represents a chat. */
    class chat implements Ichat {

        /**
         * Constructs a new chat.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.Ichat);

        /** chat banned. */
        public banned: boolean;

        /** chat welcome. */
        public welcome: boolean;

        /**
         * Creates a new chat instance using the specified properties.
         * @param [properties] Properties to set
         * @returns chat instance
         */
        public static create(properties?: database.Ichat): database.chat;

        /**
         * Encodes the specified chat message. Does not implicitly {@link database.chat.verify|verify} messages.
         * @param message chat message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.Ichat, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified chat message, length delimited. Does not implicitly {@link database.chat.verify|verify} messages.
         * @param message chat message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.Ichat, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a chat message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns chat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.chat;

        /**
         * Decodes a chat message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns chat
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.chat;

        /**
         * Verifies a chat message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a chat message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns chat
         */
        public static fromObject(object: { [k: string]: any }): database.chat;

        /**
         * Creates a plain object from a chat message. Also converts values to other types if specified.
         * @param message chat
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.chat, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this chat to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a config. */
    interface Iconfig {

        /** config autoRead */
        autoRead?: (boolean|null);
    }

    /** Represents a config. */
    class config implements Iconfig {

        /**
         * Constructs a new config.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.Iconfig);

        /** config autoRead. */
        public autoRead: boolean;

        /**
         * Creates a new config instance using the specified properties.
         * @param [properties] Properties to set
         * @returns config instance
         */
        public static create(properties?: database.Iconfig): database.config;

        /**
         * Encodes the specified config message. Does not implicitly {@link database.config.verify|verify} messages.
         * @param message config message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.Iconfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified config message, length delimited. Does not implicitly {@link database.config.verify|verify} messages.
         * @param message config message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.Iconfig, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a config message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns config
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.config;

        /**
         * Decodes a config message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns config
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.config;

        /**
         * Verifies a config message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a config message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns config
         */
        public static fromObject(object: { [k: string]: any }): database.config;

        /**
         * Creates a plain object from a config message. Also converts values to other types if specified.
         * @param message config
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.config, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this config to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a collection. */
    interface Icollection {

        /** collection users */
        users?: ({ [k: string]: database.Iuser }|null);

        /** collection chats */
        chats?: ({ [k: string]: database.Ichat }|null);

        /** collection settings */
        settings?: ({ [k: string]: database.Iconfig }|null);
    }

    /** Represents a collection. */
    class collection implements Icollection {

        /**
         * Constructs a new collection.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.Icollection);

        /** collection users. */
        public users: { [k: string]: database.Iuser };

        /** collection chats. */
        public chats: { [k: string]: database.Ichat };

        /** collection settings. */
        public settings: { [k: string]: database.Iconfig };

        /**
         * Creates a new collection instance using the specified properties.
         * @param [properties] Properties to set
         * @returns collection instance
         */
        public static create(properties?: database.Icollection): database.collection;

        /**
         * Encodes the specified collection message. Does not implicitly {@link database.collection.verify|verify} messages.
         * @param message collection message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.Icollection, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified collection message, length delimited. Does not implicitly {@link database.collection.verify|verify} messages.
         * @param message collection message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.Icollection, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a collection message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns collection
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.collection;

        /**
         * Decodes a collection message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns collection
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.collection;

        /**
         * Verifies a collection message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a collection message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns collection
         */
        public static fromObject(object: { [k: string]: any }): database.collection;

        /**
         * Creates a plain object from a collection message. Also converts values to other types if specified.
         * @param message collection
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.collection, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this collection to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
