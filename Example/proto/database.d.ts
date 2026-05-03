import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace database. */
export namespace database {

    /** Properties of a User. */
    interface IUser {

        /** User email */
        email?: (string|null);

        /** User passwordHash */
        passwordHash?: (string|null);

        /** User banned */
        banned?: (boolean|null);

        /** User name */
        name?: (string|null);

        /** User age */
        age?: (number|null);

        /** User createdAt */
        createdAt?: (number|Long|null);

        /** User updatedAt */
        updatedAt?: (number|Long|null);

        /** User coins */
        coins?: (number|Long|null);

        /** User xp */
        xp?: (number|Long|null);

        /** User level */
        level?: (number|null);

        /** User warns */
        warns?: (number|null);

        /** User number */
        number?: (string|null);

        /** User language */
        language?: (string|null);

        /** User timezone */
        timezone?: (string|null);

        /** User country */
        country?: (string|null);

        /** User registered */
        registered?: (boolean|null);

        /** User blacklist */
        blacklist?: (boolean|null);
    }

    /** Represents a User. */
    class User implements IUser {

        /**
         * Constructs a new User.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.IUser);

        /** User email. */
        public email: string;

        /** User passwordHash. */
        public passwordHash: string;

        /** User banned. */
        public banned: boolean;

        /** User name. */
        public name: string;

        /** User age. */
        public age: number;

        /** User createdAt. */
        public createdAt: (number|Long);

        /** User updatedAt. */
        public updatedAt: (number|Long);

        /** User coins. */
        public coins: (number|Long);

        /** User xp. */
        public xp: (number|Long);

        /** User level. */
        public level: number;

        /** User warns. */
        public warns: number;

        /** User number. */
        public number: string;

        /** User language. */
        public language: string;

        /** User timezone. */
        public timezone: string;

        /** User country. */
        public country: string;

        /** User registered. */
        public registered: boolean;

        /** User blacklist. */
        public blacklist: boolean;

        /**
         * Creates a new User instance using the specified properties.
         * @param [properties] Properties to set
         * @returns User instance
         */
        public static create(properties?: database.IUser): database.User;

        /**
         * Encodes the specified User message. Does not implicitly {@link database.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified User message, length delimited. Does not implicitly {@link database.User.verify|verify} messages.
         * @param message User message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a User message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.User;

        /**
         * Decodes a User message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns User
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.User;

        /**
         * Verifies a User message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a User message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns User
         */
        public static fromObject(object: { [k: string]: any }): database.User;

        /**
         * Creates a plain object from a User message. Also converts values to other types if specified.
         * @param message User
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this User to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for User
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Notify. */
    interface INotify {

        /** Notify message */
        message?: (string|null);

        /** Notify status */
        status?: (boolean|null);
    }

    /** Represents a Notify. */
    class Notify implements INotify {

        /**
         * Constructs a new Notify.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.INotify);

        /** Notify message. */
        public message: string;

        /** Notify status. */
        public status: boolean;

        /**
         * Creates a new Notify instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Notify instance
         */
        public static create(properties?: database.INotify): database.Notify;

        /**
         * Encodes the specified Notify message. Does not implicitly {@link database.Notify.verify|verify} messages.
         * @param message Notify message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.INotify, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Notify message, length delimited. Does not implicitly {@link database.Notify.verify|verify} messages.
         * @param message Notify message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.INotify, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Notify message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.Notify;

        /**
         * Decodes a Notify message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.Notify;

        /**
         * Verifies a Notify message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Notify message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Notify
         */
        public static fromObject(object: { [k: string]: any }): database.Notify;

        /**
         * Creates a plain object from a Notify message. Also converts values to other types if specified.
         * @param message Notify
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.Notify, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Notify to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Notify
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of an AntiLink. */
    interface IAntiLink {

        /** AntiLink status */
        status?: (boolean|null);

        /** AntiLink platforms */
        platforms?: ({ [k: string]: boolean }|null);
    }

    /** Represents an AntiLink. */
    class AntiLink implements IAntiLink {

        /**
         * Constructs a new AntiLink.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.IAntiLink);

        /** AntiLink status. */
        public status: boolean;

        /** AntiLink platforms. */
        public platforms: { [k: string]: boolean };

        /**
         * Creates a new AntiLink instance using the specified properties.
         * @param [properties] Properties to set
         * @returns AntiLink instance
         */
        public static create(properties?: database.IAntiLink): database.AntiLink;

        /**
         * Encodes the specified AntiLink message. Does not implicitly {@link database.AntiLink.verify|verify} messages.
         * @param message AntiLink message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.IAntiLink, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified AntiLink message, length delimited. Does not implicitly {@link database.AntiLink.verify|verify} messages.
         * @param message AntiLink message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.IAntiLink, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an AntiLink message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns AntiLink
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.AntiLink;

        /**
         * Decodes an AntiLink message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns AntiLink
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.AntiLink;

        /**
         * Verifies an AntiLink message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an AntiLink message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns AntiLink
         */
        public static fromObject(object: { [k: string]: any }): database.AntiLink;

        /**
         * Creates a plain object from an AntiLink message. Also converts values to other types if specified.
         * @param message AntiLink
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.AntiLink, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this AntiLink to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for AntiLink
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Group. */
    interface IGroup {

        /** Group prefix */
        prefix?: (string|null);

        /** Group welcome */
        welcome?: (string|null);

        /** Group bye */
        bye?: (string|null);

        /** Group mute */
        mute?: (boolean|null);

        /** Group welcomeEnabled */
        welcomeEnabled?: (boolean|null);

        /** Group name */
        name?: (string|null);

        /** Group code */
        code?: (string|null);

        /** Group antilink */
        antilink?: (database.IAntiLink|null);

        /** Group antiporn */
        antiporn?: (boolean|null);

        /** Group antionce */
        antionce?: (boolean|null);

        /** Group antifake */
        antifake?: (boolean|null);

        /** Group antitoxic */
        antitoxic?: (boolean|null);

        /** Group antidelete */
        antidelete?: (boolean|null);

        /** Group notifications */
        notifications?: ({ [k: string]: database.INotify }|null);
    }

    /** Represents a Group. */
    class Group implements IGroup {

        /**
         * Constructs a new Group.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.IGroup);

        /** Group prefix. */
        public prefix: string;

        /** Group welcome. */
        public welcome: string;

        /** Group bye. */
        public bye: string;

        /** Group mute. */
        public mute: boolean;

        /** Group welcomeEnabled. */
        public welcomeEnabled: boolean;

        /** Group name. */
        public name: string;

        /** Group code. */
        public code: string;

        /** Group antilink. */
        public antilink?: (database.IAntiLink|null);

        /** Group antiporn. */
        public antiporn: boolean;

        /** Group antionce. */
        public antionce: boolean;

        /** Group antifake. */
        public antifake: boolean;

        /** Group antitoxic. */
        public antitoxic: boolean;

        /** Group antidelete. */
        public antidelete: boolean;

        /** Group notifications. */
        public notifications: { [k: string]: database.INotify };

        /**
         * Creates a new Group instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Group instance
         */
        public static create(properties?: database.IGroup): database.Group;

        /**
         * Encodes the specified Group message. Does not implicitly {@link database.Group.verify|verify} messages.
         * @param message Group message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Group message, length delimited. Does not implicitly {@link database.Group.verify|verify} messages.
         * @param message Group message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Group message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Group
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.Group;

        /**
         * Decodes a Group message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Group
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.Group;

        /**
         * Verifies a Group message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Group message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Group
         */
        public static fromObject(object: { [k: string]: any }): database.Group;

        /**
         * Creates a plain object from a Group message. Also converts values to other types if specified.
         * @param message Group
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.Group, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Group to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Group
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Collection. */
    interface ICollection {

        /** Collection users */
        users?: ({ [k: string]: database.IUser }|null);

        /** Collection groups */
        groups?: ({ [k: string]: database.IGroup }|null);
    }

    /** Represents a Collection. */
    class Collection implements ICollection {

        /**
         * Constructs a new Collection.
         * @param [properties] Properties to set
         */
        constructor(properties?: database.ICollection);

        /** Collection users. */
        public users: { [k: string]: database.IUser };

        /** Collection groups. */
        public groups: { [k: string]: database.IGroup };

        /**
         * Creates a new Collection instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Collection instance
         */
        public static create(properties?: database.ICollection): database.Collection;

        /**
         * Encodes the specified Collection message. Does not implicitly {@link database.Collection.verify|verify} messages.
         * @param message Collection message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: database.ICollection, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Collection message, length delimited. Does not implicitly {@link database.Collection.verify|verify} messages.
         * @param message Collection message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: database.ICollection, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Collection message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Collection
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): database.Collection;

        /**
         * Decodes a Collection message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Collection
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): database.Collection;

        /**
         * Verifies a Collection message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Collection message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Collection
         */
        public static fromObject(object: { [k: string]: any }): database.Collection;

        /**
         * Creates a plain object from a Collection message. Also converts values to other types if specified.
         * @param message Collection
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: database.Collection, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Collection to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Collection
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
