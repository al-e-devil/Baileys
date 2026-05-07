import { Boom } from '@hapi/boom'
import { proto } from '../../WAProto/index.js'
import { NOISE_MODE, WA_CERT_DETAILS } from '../Defaults'
import type { KeyPair } from '../Types'
import type { BinaryNode } from '../WABinary'
import { decodeBinaryNode } from '../WABinary'
import { aesDecryptGCM, aesEncryptGCM, Curve, hkdf, sha256 } from './crypto'
import { ERR_NOISE_CERT_INVALID, ERR_NOISE_CERT_SIG_INVALID, ERR_NOISE_SERIAL_MISMATCH } from './errors'
import type { ILogger } from './logger'

/**
 * Configuration object accepted by {@link makeNoiseHandler}.
 */
export interface NoiseHandlerConfig {
	/** The ephemeral Curve25519 key pair for this connection session. */
	keyPair: KeyPair
	/**
	 * The fixed WA Noise protocol header bytes prepended to the very first
	 * outbound frame (e.g. `NOISE_WA_HEADER`).
	 */
	NOISE_HEADER: Uint8Array
	/** Pino-compatible logger instance. */
	logger: ILogger
	/**
	 * Optional routing info buffer. When provided it is embedded in the intro
	 * header so the WA edge server can route the connection correctly.
	 */
	routingInfo?: Buffer | undefined
}

/**
 * The object returned by {@link makeNoiseHandler}.
 * All members must remain stable — external code depends on these names.
 */
export interface NoiseHandler {
	/** Mixes `data` into the running handshake hash (no-op once transport is live). */
	authenticate(data: Uint8Array): void
	/**
	 * Encrypts `plaintext` using the current handshake key (pre-transport) or
	 * the live transport write key (post-transport).
	 * @throws `Error` with code `ERR_PROTO_NOISE_ENCRYPT` on unexpected failure.
	 */
	encrypt(plaintext: Uint8Array): Uint8Array
	/**
	 * Decrypts `ciphertext` using the current handshake key (pre-transport) or
	 * the live transport read key (post-transport).
	 * @throws `Error` with code `ERR_PROTO_NOISE_DECRYPT` on unexpected failure.
	 */
	decrypt(ciphertext: Uint8Array): Uint8Array
	/** Derives new `encKey`/`decKey` from `data` via HKDF and resets the counter. */
	mixIntoKey(data: Uint8Array): void
	/**
	 * Finalises the Noise handshake and transitions the handler to transport
	 * mode. Any frames that arrived while the transport was being set up are
	 * flushed immediately after the transition.
	 */
	finishInit(): Promise<void>
	/**
	 * Validates the server's Noise handshake message, verifies the full
	 * certificate chain, and returns the encrypted local noise public key that
	 * must be sent back to complete the handshake.
	 *
	 * @param message  - The decoded `HandshakeMessage` received from the server.
	 * @param noiseKey - The long-term Noise key pair of the local device.
	 * @returns The encrypted local Noise public key (`keyEnc`) to be forwarded
	 *          to the server.
	 * @throws {@link Boom} with code {@link ERR_NOISE_CERT_INVALID} when the
	 *         leaf or intermediate certificate is structurally incomplete.
	 * @throws {@link Boom} with code {@link ERR_NOISE_CERT_SIG_INVALID} when
	 *         any signature in the chain fails verification.
	 * @throws {@link Boom} with code {@link ERR_NOISE_SERIAL_MISMATCH} when
	 *         the issuerSerial does not match {@link WA_CERT_DETAILS.SERIAL}.
	 */
	processHandshake(message: proto.HandshakeMessage, noiseKey: KeyPair): Uint8Array
	/**
	 * Encodes `data` into a framed binary message ready for transport.
	 *
	 * Frame layout (after optional intro header):
	 * ```
	 * [  3 bytes big-endian payload length  |  N bytes payload  ]
	 * ```
	 * If a transport is active the payload is AES-GCM encrypted before framing.
	 * The intro header (WA magic bytes + routing info) is prepended once to the
	 * very first frame and never repeated.
	 *
	 * @param data - Raw or pre-serialised bytes to frame.
	 * @returns A `Buffer` ready to be written to the underlying TCP socket.
	 * @throws `Error` with code `ERR_PROTO_NOISE_ENCODE_FRAME` on unexpected failure.
	 *         (legacy: `ERR_NOISE_ENCODE_FRAME`).
	 */
	encodeFrame(data: Buffer | Uint8Array): Buffer
	/**
	 * Consumes incoming raw bytes, reassembles frames from the internal buffer,
	 * decrypts each frame (when the transport is live), and calls `onFrame` for
	 * every complete message.
	 *
	 * If the transport is not yet initialised the bytes are buffered and
	 * `onFrame` is stored so that accumulated data can be flushed once
	 * {@link finishInit} completes.
	 *
	 * @param newData - The latest chunk received from the socket.
	 * @param onFrame - Callback invoked with each decoded frame. Receives a raw
	 *                  `Uint8Array` during the handshake phase or a fully decoded
	 *                  {@link BinaryNode} during the transport phase.
	 * @throws `Error` with code `ERR_PROTO_NOISE_DECODE_FRAME` on unexpected failure.
	 *         (legacy: `ERR_NOISE_DECODE_FRAME`).
	 */
	decodeFrame(newData: Buffer | Uint8Array, onFrame: (buff: Uint8Array | BinaryNode) => void): Promise<void>
}

const CONFIG = {
	IV_LENGTH: 12,
	IV_COUNTER_OFFSET: 8,
	FRAME_LENGTH_BYTES: 3,
	INTRO_HEADER_PREFIX_LENGTH: 7
} as const

const ERROR_CODES = {
	PROTO_NOISE_HANDSHAKE: 'ERR_PROTO_NOISE_HANDSHAKE',
	PROTO_NOISE_ENCRYPT: 'ERR_PROTO_NOISE_ENCRYPT',
	PROTO_NOISE_DECRYPT: 'ERR_PROTO_NOISE_DECRYPT',
	PROTO_NOISE_ENCODE_FRAME: 'ERR_PROTO_NOISE_ENCODE_FRAME',
	PROTO_NOISE_DECODE_FRAME: 'ERR_PROTO_NOISE_DECODE_FRAME',
	LEGACY_NOISE_HANDSHAKE: 'ERR_NOISE_HANDSHAKE',
	LEGACY_NOISE_ENCODE_FRAME: 'ERR_NOISE_ENCODE_FRAME',
	LEGACY_NOISE_DECODE_FRAME: 'ERR_NOISE_DECODE_FRAME'
} as const

const EMPTY_BUFFER = Buffer.alloc(0)

const writeCounterToIV = (iv: Uint8Array, counter: number): void => {
	const offset = CONFIG.IV_COUNTER_OFFSET
	iv[offset] = (counter >>> 24) & 0xff
	iv[offset + 1] = (counter >>> 16) & 0xff
	iv[offset + 2] = (counter >>> 8) & 0xff
	iv[offset + 3] = counter & 0xff
}

const generateIV = (counter: number): Uint8Array => {
	const iv = new Uint8Array(CONFIG.IV_LENGTH)
	writeCounterToIV(iv, counter)
	return iv
}

const wrapProtocolError = (
	code: string,
	message: string,
	cause: unknown,
	legacyCode?: string
): NodeJS.ErrnoException & { cause?: unknown; legacyCode?: string } => {
	const wrapped = new Error(message) as NodeJS.ErrnoException & { cause?: unknown; legacyCode?: string }
	wrapped.code = code
	wrapped.cause = cause
	if (legacyCode) {
		wrapped.legacyCode = legacyCode
	}
	return wrapped
}

class TransportState {
	private readCounter = 0
	private writeCounter = 0

	private readonly iv = new Uint8Array(CONFIG.IV_LENGTH)

	constructor(
		private readonly encKey: Uint8Array,
		private readonly decKey: Uint8Array
	) {}

	encrypt(plaintext: Uint8Array): Uint8Array {
		const counter = this.writeCounter++
		writeCounterToIV(this.iv, counter)
		return aesEncryptGCM(plaintext, this.encKey, this.iv, EMPTY_BUFFER)
	}

	decrypt(ciphertext: Uint8Array): Buffer {
		const counter = this.readCounter++
		writeCounterToIV(this.iv, counter)
		return aesDecryptGCM(ciphertext, this.decKey, this.iv, EMPTY_BUFFER) as Buffer
	}
}

export const makeNoiseHandler = ({
	keyPair: { private: privateKey, public: publicKey },
	NOISE_HEADER,
	logger,
	routingInfo
}: NoiseHandlerConfig): NoiseHandler => {
	logger = logger.child({ class: 'ns' })

	const data = Buffer.from(NOISE_MODE)
	let hash = data.byteLength === 32 ? data : sha256(data)
	let salt: Uint8Array = hash
	let encKey: Uint8Array = hash
	let decKey: Uint8Array = hash
	let counter = 0
	let sentIntro = false

	let inBytes: Buffer = Buffer.alloc(0)

	let transport: TransportState | null = null
	let isWaitingForTransport = false
	let pendingOnFrame: ((buff: Uint8Array | BinaryNode) => void) | null = null

	let introHeader: Buffer
	if (routingInfo) {
		introHeader = Buffer.alloc(CONFIG.INTRO_HEADER_PREFIX_LENGTH + routingInfo.byteLength + NOISE_HEADER.length)
		introHeader.write('ED', 0, 'utf8')
		introHeader.writeUint8(0, 2)
		introHeader.writeUint8(1, 3)
		introHeader.writeUint8(routingInfo.byteLength >> 16, 4)
		introHeader.writeUint16BE(routingInfo.byteLength & 65535, 5)
		introHeader.set(routingInfo, CONFIG.INTRO_HEADER_PREFIX_LENGTH)
		introHeader.set(NOISE_HEADER, CONFIG.INTRO_HEADER_PREFIX_LENGTH + routingInfo.byteLength)
	} else {
		introHeader = Buffer.from(NOISE_HEADER)
	}

	const authenticate = (data: Uint8Array): void => {
		if (!transport) {
			hash = sha256(Buffer.concat([hash, data]))
		}
	}

	const encrypt = (plaintext: Uint8Array): Uint8Array => {
		try {
			if (transport) {
				return transport.encrypt(plaintext)
			}

			const result = aesEncryptGCM(plaintext, encKey, generateIV(counter++), hash)
			authenticate(result)
			return result
		} catch (err) {
			logger.error({ err, code: ERROR_CODES.PROTO_NOISE_ENCRYPT }, 'Noise encrypt failed')
			throw wrapProtocolError(ERROR_CODES.PROTO_NOISE_ENCRYPT, 'noise encrypt failed', err)
		}
	}

	const decrypt = (ciphertext: Uint8Array): Uint8Array => {
		try {
			if (transport) {
				return transport.decrypt(ciphertext)
			}

			const result = aesDecryptGCM(ciphertext, decKey, generateIV(counter++), hash)
			authenticate(ciphertext)
			return result
		} catch (err) {
			logger.error({ err, code: ERROR_CODES.PROTO_NOISE_DECRYPT }, 'Noise decrypt failed')
			throw wrapProtocolError(ERROR_CODES.PROTO_NOISE_DECRYPT, 'noise decrypt failed', err)
		}
	}

	const localHKDF = (data: Uint8Array): [Uint8Array, Uint8Array] => {
		const key = hkdf(Buffer.from(data), 64, { salt, info: '' })
		return [key.subarray(0, 32), key.subarray(32)]
	}

	const mixIntoKey = (data: Uint8Array): void => {
		const [write, read] = localHKDF(data)
		salt = write
		encKey = read
		decKey = read
		counter = 0
	}

	/**
	 * Finalises the Noise handshake and transitions the handler to transport
	 * mode. Any frames buffered while the transport was initialising are
	 * flushed immediately after the transition completes.
	 */
	const finishInit = async (): Promise<void> => {
		isWaitingForTransport = true
		const [write, read] = localHKDF(new Uint8Array(0))
		transport = new TransportState(write, read)
		isWaitingForTransport = false

		logger.trace('Noise handler transitioned to Transport state')

		if (pendingOnFrame) {
			logger.trace({ length: inBytes.length }, 'Flushing buffered frames after transport ready')
			await processData(pendingOnFrame)
			pendingOnFrame = null
		}
	}

	const processData = async (onFrame: (buff: Uint8Array | BinaryNode) => void): Promise<void> => {
		let size: number | undefined

		while (true) {
			if (inBytes.length < CONFIG.FRAME_LENGTH_BYTES) return

			size = (inBytes[0]! << 16) | (inBytes[1]! << 8) | inBytes[2]!

			if (inBytes.length < size + CONFIG.FRAME_LENGTH_BYTES) return

			let frame: Uint8Array | BinaryNode = inBytes.subarray(CONFIG.FRAME_LENGTH_BYTES, size + CONFIG.FRAME_LENGTH_BYTES)
			inBytes = inBytes.subarray(size + CONFIG.FRAME_LENGTH_BYTES)

			if (transport) {
				const result = decrypt(frame)
				frame = await decodeBinaryNode(result)
			}

			if (logger.level === 'trace' || logger.level === 'debug') {
				logger.debug({ msg: (frame as BinaryNode)?.attrs?.id ?? 'unknown' }, 'recv frame')
			}

			onFrame(frame)
		}
	}

	authenticate(NOISE_HEADER)
	authenticate(publicKey)

	return {
		encrypt,
		decrypt,
		authenticate,
		mixIntoKey,
		finishInit,

		/**
		 * Validates the server's Noise handshake message, verifies the full
		 * certificate chain (leaf + intermediate + issuerSerial), and returns the
		 * encrypted local Noise public key to complete the handshake.
		 *
		 * Steps performed (in order, none may be skipped):
		 *  1. `authenticate` — mix server ephemeral into the handshake hash.
		 *  2. `mixIntoKey`   — mix the DH shared secret into the key schedule.
		 *  3. Decrypt + verify the static content and certificate chain.
		 *  4. `finishInit`   — implicitly triggered by the caller after this returns.
		 *
		 * @param message  - Decoded `HandshakeMessage` from the server.
		 * @param noiseKey - Long-term Noise key pair of the local device.
		 * @returns Encrypted local Noise public key (`keyEnc`).
		 */
		processHandshake: ({ serverHello }: proto.HandshakeMessage, noiseKey: KeyPair): Uint8Array => {
			try {
				if (!serverHello?.ephemeral || !serverHello?.static || !serverHello?.payload) {
					throw new Boom('noise handshake message incomplete', {
						statusCode: 400,
						data: {
							code: ERROR_CODES.PROTO_NOISE_HANDSHAKE,
							legacyCode: ERROR_CODES.LEGACY_NOISE_HANDSHAKE,
							cause: new Error('serverHello missing required fields')
						}
					})
				}

				authenticate(serverHello.ephemeral)
				mixIntoKey(Curve.sharedKey(privateKey, serverHello.ephemeral))

				const decStaticContent = decrypt(serverHello.static)
				mixIntoKey(Curve.sharedKey(privateKey, decStaticContent))

				const certDecoded = decrypt(serverHello.payload)

				const { intermediate: certIntermediate, leaf } = proto.CertChain.decode(certDecoded)

				// Validate leaf certificate structure
				if (!leaf?.details || !leaf?.signature) {
					throw new Boom('invalid noise leaf certificate', {
						statusCode: 400,
						data: { code: ERR_NOISE_CERT_INVALID }
					})
				}

				// Validate intermediate certificate structure
				if (!certIntermediate?.details || !certIntermediate?.signature) {
					throw new Boom('invalid noise intermediate certificate', {
						statusCode: 400,
						data: { code: ERR_NOISE_CERT_INVALID }
					})
				}

				const details = proto.CertChain.NoiseCertificate.Details.decode(certIntermediate.details)

				const { issuerSerial } = details

				// Verify leaf signature against the intermediate certificate's key
				const verify = Curve.verify(details.key!, leaf.details, leaf.signature)

				// Verify intermediate certificate against the hardcoded WA public key
				const verifyIntermediate = Curve.verify(
					WA_CERT_DETAILS.PUBLIC_KEY,
					certIntermediate.details,
					certIntermediate.signature
				)

				if (!verify) {
					throw new Boom('noise certificate signature invalid', {
						statusCode: 400,
						data: { code: ERR_NOISE_CERT_SIG_INVALID }
					})
				}

				if (!verifyIntermediate) {
					throw new Boom('noise intermediate certificate signature invalid', {
						statusCode: 400,
						data: { code: ERR_NOISE_CERT_SIG_INVALID }
					})
				}

				if (issuerSerial !== WA_CERT_DETAILS.SERIAL) {
					throw new Boom('certification match failed', {
						statusCode: 400,
						data: { code: ERR_NOISE_SERIAL_MISMATCH }
					})
				}

				const keyEnc = encrypt(noiseKey.public)
				mixIntoKey(Curve.sharedKey(noiseKey.private, serverHello.ephemeral))

				return keyEnc
			} catch (err) {
				// Re-throw Boom errors as-is (they already carry code + statusCode).
				if (err instanceof Boom) {
					throw err
				}

				// Wrap unexpected lower-level errors so callers always get a structured error.
				logger.error({ err, code: ERROR_CODES.PROTO_NOISE_HANDSHAKE }, 'Noise handshake failed')
				throw new Boom('noise handshake failed unexpectedly', {
					statusCode: 500,
					data: {
						code: ERROR_CODES.PROTO_NOISE_HANDSHAKE,
						legacyCode: ERROR_CODES.LEGACY_NOISE_HANDSHAKE,
						cause: err
					}
				})
			}
		},

		/**
		 * Encodes `data` into a framed binary message ready for transport.
		 *
		 * Frame layout (after optional intro header):
		 * ```
		 * [  3 bytes big-endian payload length  |  N bytes payload  ]
		 * ```
		 * When a transport session is active the payload is AES-GCM encrypted
		 * before framing. The intro header (WA magic bytes + optional routing
		 * info) is written once into the very first frame only.
		 *
		 * @param data - Raw bytes to frame (will be encrypted if transport is live).
		 * @returns A `Buffer` containing the fully framed message.
		 * @throws `Error` with code `ERR_PROTO_NOISE_ENCODE_FRAME` on unexpected failure.
		 *         (legacy: `ERR_NOISE_ENCODE_FRAME`).
		 */
		encodeFrame: (data: Buffer | Uint8Array): Buffer => {
			try {
				if (transport) {
					data = transport.encrypt(data)
				}

				const dataLen = data.byteLength
				const introSize = sentIntro ? 0 : introHeader.length
				const frame = Buffer.allocUnsafe(introSize + CONFIG.FRAME_LENGTH_BYTES + dataLen)

				if (!sentIntro) {
					frame.set(introHeader)
					sentIntro = true
				}

				frame[introSize] = (dataLen >>> 16) & 0xff
				frame[introSize + 1] = (dataLen >>> 8) & 0xff
				frame[introSize + 2] = dataLen & 0xff

				frame.set(data, introSize + CONFIG.FRAME_LENGTH_BYTES)

				if (logger.level === 'trace' || logger.level === 'debug') {
					logger.debug({ length: dataLen }, 'send frame')
				}

				return frame
			} catch (err) {
				if (err instanceof Boom) {
					throw err
				}

				logger.error({ err, code: ERROR_CODES.PROTO_NOISE_ENCODE_FRAME }, 'Noise frame encode failed')
				throw wrapProtocolError(
					ERROR_CODES.PROTO_NOISE_ENCODE_FRAME,
					'failed to encode noise frame',
					err,
					ERROR_CODES.LEGACY_NOISE_ENCODE_FRAME
				)
			}
		},

		/**
		 * Consumes incoming raw bytes, reassembles frames using the 3-byte
		 * big-endian length prefix, decrypts each frame when the transport is
		 * live, and invokes `onFrame` for every complete message.
		 *
		 * If the transport has not yet been initialised the bytes are buffered
		 * internally and `onFrame` is retained so that accumulated data is
		 * flushed automatically when {@link finishInit} completes.
		 *
		 * @param newData - Latest chunk received from the socket.
		 * @param onFrame - Callback invoked per decoded frame.  Receives a raw
		 *                  `Uint8Array` during the handshake phase or a fully
		 *                  decoded {@link BinaryNode} during transport phase.
		 * @throws `Error` with code `ERR_PROTO_NOISE_DECODE_FRAME` on unexpected failure.
		 *         (legacy: `ERR_NOISE_DECODE_FRAME`).
		 */
		decodeFrame: async (
			newData: Buffer | Uint8Array,
			onFrame: (buff: Uint8Array | BinaryNode) => void
		): Promise<void> => {
			try {
				if (isWaitingForTransport) {
					inBytes = Buffer.concat([inBytes, newData])
					pendingOnFrame = onFrame
					return
				}

				if (inBytes.length === 0) {
					inBytes = Buffer.from(newData)
				} else {
					inBytes = Buffer.concat([inBytes, newData])
				}

				await processData(onFrame)
			} catch (err) {
				if (err instanceof Boom) {
					throw err
				}

				logger.error({ err, code: ERROR_CODES.PROTO_NOISE_DECODE_FRAME }, 'Noise frame decode failed')
				throw wrapProtocolError(
					ERROR_CODES.PROTO_NOISE_DECODE_FRAME,
					'failed to decode noise frame',
					err,
					ERROR_CODES.LEGACY_NOISE_DECODE_FRAME
				)
			}
		}
	}
}
