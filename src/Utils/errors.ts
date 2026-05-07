/**
 * @file errors.ts
 * Centralised error-code registry for Baileys.
 *
 * Every structured error thrown inside the library MUST use one of the codes
 * defined here so that callers can `switch` on `error.data.code` without
 * importing magic strings from individual modules.
 *
 * Naming convention:
 *   ERR_WS_*     — WebSocket transport layer
 *   ERR_PROTO_*  — Noise / Signal / binary-frame protocol layer
 *   ERR_MEDIA_*  — Media upload / download / encryption layer
 */

// ---------------------------------------------------------------------------
// WebSocket transport
// ---------------------------------------------------------------------------

/** Thrown when a send is attempted on a closed or closing WebSocket. */
export const ERR_WS_CLOSED = 'ERR_WS_CLOSED'

/** Thrown when a WebSocket send() call fails at the OS/network level. */
export const ERR_WS_SEND = 'ERR_WS_SEND'

/** Thrown when the keep-alive ping IQ fails to send or times out. */
export const ERR_WS_KEEPALIVE = 'ERR_WS_KEEPALIVE'

// ---------------------------------------------------------------------------
// Protocol layer — Noise / Signal / frame encoding
// ---------------------------------------------------------------------------

/** Thrown when the full Noise_XX handshake sequence fails. */
export const ERR_PROTO_HANDSHAKE = 'ERR_PROTO_HANDSHAKE'

/** Thrown when binary frame encoding fails (e.g. encryption error). */
export const ERR_PROTO_ENCODE_FRAME = 'ERR_PROTO_ENCODE_FRAME'

/** Thrown when pre-key upload to the WA server fails. */
export const ERR_PROTO_PREKEY_UPLOAD = 'ERR_PROTO_PREKEY_UPLOAD'

/** Thrown when the Noise leaf or intermediate certificate is structurally invalid. */
export const ERR_NOISE_CERT_INVALID = 'ERR_NOISE_CERT_INVALID'

/** Thrown when a Noise certificate signature fails Curve25519 verification. */
export const ERR_NOISE_CERT_SIG_INVALID = 'ERR_NOISE_CERT_SIG_INVALID'

/** Thrown when the issuerSerial in the certificate chain does not match the expected WA serial. */
export const ERR_NOISE_SERIAL_MISMATCH = 'ERR_NOISE_SERIAL_MISMATCH'

/** Thrown when a message stanza is missing the mandatory `id` attribute. */
export const ERR_PROTO_MISSING_ID = 'ERR_PROTO_MISSING_ID'

/** Thrown when a message stanza is missing the mandatory `from` attribute. */
export const ERR_PROTO_MISSING_FROM = 'ERR_PROTO_MISSING_FROM'

/** Thrown when Signal decryption fails (wrong key, tampered ciphertext, etc.). */
export const ERR_PROTO_DECRYPT = 'ERR_PROTO_DECRYPT'

/** Thrown when sender-key distribution message processing fails. */
export const ERR_PROTO_SKEY_DIST = 'ERR_PROTO_SKEY_DIST'

// ---------------------------------------------------------------------------
// Media layer — upload / download / encryption
// ---------------------------------------------------------------------------

/** Thrown when the media type cannot be determined from the message content. */
export const ERR_MEDIA_UNKNOWN_TYPE = 'ERR_MEDIA_UNKNOWN_TYPE'

/** Thrown when media upload to the WA server fails on all available hosts. */
export const ERR_MEDIA_UPLOAD_FAILED = 'ERR_MEDIA_UPLOAD_FAILED'

/** Thrown when media download or decryption fails. */
export const ERR_MEDIA_DOWNLOAD_FAILED = 'ERR_MEDIA_DOWNLOAD_FAILED'

/** Thrown when a message has no extractable media content. */
export const ERR_MEDIA_NO_CONTENT = 'ERR_MEDIA_NO_CONTENT'

/** Thrown when a media retry request decryption fails. */
export const ERR_MEDIA_RETRY_DECRYPT = 'ERR_MEDIA_RETRY_DECRYPT'
