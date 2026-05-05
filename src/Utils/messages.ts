import { Boom } from '@hapi/boom'
import { randomBytes } from 'crypto'
import { promises as fs } from 'fs'
import { type Transform } from 'stream'
import { proto } from '../../WAProto/index.js'
import {
	CALL_AUDIO_PREFIX,
	CALL_VIDEO_PREFIX,
	MEDIA_KEYS,
	type MediaType,
	URL_REGEX,
	WA_DEFAULT_EPHEMERAL
} from '../Defaults'
import type {
	AnyMediaMessageContent,
	AnyMessageContent,
	DownloadableMessage,
	MessageContentGenerationOptions,
	MessageGenerationOptions,
	MessageGenerationOptionsFromContent,
	MessageUserReceipt,
	MessageWithContextInfo,
	CarouselCard,
	WAMediaUpload,
	WAMessage,
	WAMessageContent,
	WAMessageKey,
	WATextMessage
} from '../Types'
import { WAMessageStatus, WAProto } from '../Types'
import { isJidGroup, isJidNewsletter, isJidStatusBroadcast, jidNormalizedUser } from '../WABinary'
import { sha256 } from './crypto'
import { generateMessageIDV2, getKeyAuthor, unixTimestampSeconds } from './generics'
import type { ILogger } from './logger'
import {
	downloadContentFromMessage,
	encryptedStream,
	extractImageThumb,
	generateThumbnail,
	getAudioDuration,
	getAudioWaveform,
	getRawMediaUploadData,
	type MediaDownloadOptions
} from './messages-media'
import { shouldIncludeReportingToken } from './reporting-utils'

type ExtractByKey<T, K extends PropertyKey> = T extends any ? (K extends keyof T ? T : never) : never
type RequireKey<T, K extends keyof T> = T & {
	[P in K]-?: Exclude<T[P], null | undefined>
}

type WithKey<T, K extends PropertyKey> = T extends unknown ? (K extends keyof T ? RequireKey<T, K> : never) : never

type MediaUploadData = {
	media: WAMediaUpload
	caption?: string
	ptt?: boolean
	ptv?: boolean
	seconds?: number
	gifPlayback?: boolean
	fileName?: string
	jpegThumbnail?: string
	mimetype?: string
	width?: number
	height?: number
	waveform?: Uint8Array
	backgroundArgb?: number
}

const MIMETYPE_MAP: { [T in MediaType]?: string } = {
	image: 'image/jpeg',
	video: 'video/mp4',
	document: 'application/pdf',
	audio: 'audio/ogg; codecs=opus',
	sticker: 'image/webp',
	'product-catalog-image': 'image/jpeg'
}

const MessageTypeProto = {
	image: WAProto.Message.ImageMessage,
	video: WAProto.Message.VideoMessage,
	audio: WAProto.Message.AudioMessage,
	sticker: WAProto.Message.StickerMessage,
	document: WAProto.Message.DocumentMessage
} as const

/**
 * Uses a regex to test whether the string contains a URL, and returns the URL if it does.
 * @param text eg. hello https://google.com
 * @returns the URL, eg. https://google.com
 */
export const extractUrlFromText = (text: string) => text.match(URL_REGEX)?.[0]

/** Get the key to access the true type of content */
export const getContentType = (content: proto.IMessage | undefined) => {
	if (content) {
		const keys = Object.keys(content)
		const key = keys.find(k => (k === 'conversation' || k.includes('Message')) && k !== 'senderKeyDistributionMessage')
		return key as keyof typeof content
	}
}

/**
 * Normalizes ephemeral, view once messages to regular message content
 * Eg. image messages in ephemeral messages, in view once messages etc.
 * @param content
 * @returns
 */
export const normalizeMessageContent = (content: WAMessageContent | null | undefined): WAMessageContent | undefined => {
	if (!content) {
		return undefined
	}

	// set max iterations to prevent an infinite loop
	for (let i = 0; i < 5; i++) {
		const inner = getFutureProofMessage(content)
		if (!inner) {
			break
		}

		content = inner.message
	}


	return content!

	function getFutureProofMessage(message: typeof content) {
		return (
			message?.ephemeralMessage ||
			message?.viewOnceMessage ||
			message?.documentWithCaptionMessage ||
			message?.viewOnceMessageV2 ||
			message?.viewOnceMessageV2Extension ||
			message?.editedMessage ||
			message?.associatedChildMessage ||
			message?.groupStatusMessage ||
			message?.groupStatusMessageV2
		)
	}
}

/**
 * Returns the device predicted by message ID
 */
export const getDevice = (id: string) =>
	/^3A.{18}$/.test(id)
		? 'ios'
		: /^3E.{20}$/.test(id)
			? 'web'
			: /^(.{21}|.{32})$/.test(id)
				? 'android'
				: /^(3F|.{18}$)/.test(id)
					? 'desktop'
					: 'unknown'

export const generateLinkPreviewIfRequired = async (
	text: string,
	getUrlInfo: MessageGenerationOptions['getUrlInfo'],
	logger: MessageGenerationOptions['logger']
) => {
	const url = extractUrlFromText(text)
	if (!!getUrlInfo && url) {
		try {
			const urlInfo = await getUrlInfo(url)
			return urlInfo
		} catch (error: any) {
			// ignore if fails
			logger?.warn({ trace: error.stack }, 'url generation failed')
		}
	}
}

const assertColor = async (color: any) => {
	let assertedColor
	if (typeof color === 'number') {
		assertedColor = color > 0 ? color : 0xffffffff + Number(color) + 1
	} else {
		let hex = color.trim().replace('#', '')
		if (hex.length <= 6) {
			hex = 'FF' + hex.padStart(6, '0')
		}

		assertedColor = parseInt(hex, 16)
		return assertedColor
	}
}

export const prepareWAMessageMedia = async (
	message: AnyMediaMessageContent,
	options: MessageGenerationOptions
) => {
	const logger = options.logger

	let mediaType: (typeof MEDIA_KEYS)[number] | undefined
	for (const key of MEDIA_KEYS) {
		if (key in message) {
			mediaType = key
		}
	}

	if (!mediaType) {
		throw new Boom('Invalid media type', { statusCode: 400 })
	}

	const uploadData: MediaUploadData = {
		...message,
		media: (message as any)[mediaType]
	}
	delete (uploadData as any)[mediaType]
	// check if cacheable + generate cache key
	const cacheableKey =
		typeof uploadData.media === 'object' &&
		'url' in uploadData.media &&
		!!uploadData.media.url &&
		!!options.mediaCache &&
		mediaType + ':' + uploadData.media.url.toString()

	if (mediaType === 'document' && !uploadData.fileName) {
		uploadData.fileName = 'file'
	}

	if (!uploadData.mimetype) {
		uploadData.mimetype = MIMETYPE_MAP[mediaType]
	}

	if (cacheableKey) {
		const mediaBuff = await options.mediaCache!.get<Buffer>(cacheableKey)
		if (mediaBuff) {
			logger?.debug({ cacheableKey }, 'got media cache hit')

			const obj = proto.Message.decode(mediaBuff)
			const key = `${mediaType}Message`

			Object.assign(obj[key as keyof proto.Message]!, { ...uploadData, media: undefined })

			return obj
		}
	}

	const isNewsletter = !!options.jid && isJidNewsletter(options.jid)
	if (isNewsletter) {
		logger?.info({ key: cacheableKey }, 'Preparing raw media for newsletter')
		const { filePath, fileSha256, fileLength } = await getRawMediaUploadData(
			uploadData.media,
			options.mediaTypeOverride || mediaType,
			logger
		)

		const fileSha256B64 = fileSha256.toString('base64')
		const { mediaUrl, directPath } = await options.upload(filePath, {
			fileEncSha256B64: fileSha256B64,
			mediaType: mediaType,
			timeoutMs: options.mediaUploadTimeoutMs
		})

		await fs.unlink(filePath)

		const obj = WAProto.Message.fromObject({
			// todo: add more support here
			[`${mediaType}Message`]: (MessageTypeProto as any)[mediaType].fromObject({
				url: mediaUrl,
				directPath,
				fileSha256,
				fileLength,
				...uploadData,
				media: undefined
			})
		})

		if (uploadData.ptv) {
			obj.ptvMessage = obj.videoMessage
			delete obj.videoMessage
		}

		if (obj.stickerMessage) {
			obj.stickerMessage.stickerSentTs = Date.now()
		}

		if (cacheableKey) {
			logger?.debug({ cacheableKey }, 'set cache')
			await options.mediaCache!.set(cacheableKey, WAProto.Message.encode(obj).finish())
		}

		return obj
	}

	const requiresDurationComputation = mediaType === 'audio' && typeof uploadData.seconds === 'undefined'
	const requiresThumbnailComputation =
		(mediaType === 'image' || mediaType === 'video') && typeof uploadData['jpegThumbnail'] === 'undefined'
	const requiresWaveformProcessing =
		mediaType === 'audio' && uploadData.ptt === true && typeof uploadData.waveform === 'undefined'
	const requiresAudioBackground = options.backgroundColor && mediaType === 'audio' && uploadData.ptt === true
	const requiresOriginalForSomeProcessing = requiresDurationComputation || requiresThumbnailComputation
	const { mediaKey, encFilePath, originalFilePath, fileEncSha256, fileSha256, fileLength } = await encryptedStream(
		uploadData.media,
		options.mediaTypeOverride || mediaType,
		{
			logger,
			saveOriginalFileIfRequired: requiresOriginalForSomeProcessing,
			opts: options.options
		}
	)

	const fileEncSha256B64 = fileEncSha256.toString('base64')
	const [{ mediaUrl, directPath }] = await Promise.all([
		(async () => {
			const result = await options.upload(encFilePath, {
				fileEncSha256B64,
				mediaType,
				timeoutMs: options.mediaUploadTimeoutMs
			})
			logger?.debug({ mediaType, cacheableKey }, 'uploaded media')
			return result
		})(),
		(async () => {
			try {
				if (requiresThumbnailComputation) {
					const { thumbnail, originalImageDimensions } = await generateThumbnail(
						originalFilePath!,
						mediaType as 'image' | 'video',
						options
					)
					uploadData.jpegThumbnail = thumbnail
					if (!uploadData.width && originalImageDimensions) {
						uploadData.width = originalImageDimensions.width
						uploadData.height = originalImageDimensions.height
						logger?.debug('set dimensions')
					}

					logger?.debug('generated thumbnail')
				}

				if (requiresDurationComputation) {
					uploadData.seconds = await getAudioDuration(originalFilePath!)
					logger?.debug('computed audio duration')
				}

				if (requiresWaveformProcessing) {
					uploadData.waveform = await getAudioWaveform(originalFilePath!, logger)
					logger?.debug('processed waveform')
				}

				if (requiresAudioBackground) {
					uploadData.backgroundArgb = await assertColor(options.backgroundColor)
					logger?.debug('computed backgroundColor audio status')
				}
			} catch (error) {
				logger?.warn({ trace: (error as any).stack }, 'failed to obtain extra info')
			}
		})()
	]).finally(async () => {
		try {
			await fs.unlink(encFilePath)
			if (originalFilePath) {
				await fs.unlink(originalFilePath)
			}

			logger?.debug('removed tmp files')
		} catch (error) {
			logger?.warn('failed to remove tmp file')
		}
	})

	const obj = WAProto.Message.fromObject({
		[`${mediaType}Message`]: MessageTypeProto[mediaType as keyof typeof MessageTypeProto].fromObject({
			url: mediaUrl,
			directPath,
			mediaKey,
			fileEncSha256,
			fileSha256,
			fileLength,
			mediaKeyTimestamp: unixTimestampSeconds(),
			...uploadData,
			media: undefined
		} as any)
	})

	if (uploadData.ptv) {
		obj.ptvMessage = obj.videoMessage
		delete obj.videoMessage
	}

	if (cacheableKey) {
		logger?.debug({ cacheableKey }, 'set cache')
		await options.mediaCache!.set(cacheableKey, WAProto.Message.encode(obj).finish())
	}

	return obj
}

export const prepareDisappearingMessageSettingContent = (ephemeralExpiration?: number) => {
	ephemeralExpiration = ephemeralExpiration || 0
	const content: WAMessageContent = {
		ephemeralMessage: {
			message: {
				protocolMessage: {
					type: WAProto.Message.ProtocolMessage.Type.EPHEMERAL_SETTING,
					ephemeralExpiration
				}
			}
		}
	}
	return WAProto.Message.fromObject(content)
}

/**
 * Generate forwarded message content like WA does
 * @param message the message to forward
 * @param options.forceForward will show the message as forwarded even if it is from you
 */
export const generateForwardMessageContent = (message: WAMessage, forceForward?: boolean) => {
	let content = message.message
	if (!content) {
		throw new Boom('no content in message', { statusCode: 400 })
	}

	// hacky copy
	content = normalizeMessageContent(content)
	content = proto.Message.decode(proto.Message.encode(content!).finish())

	let key = Object.keys(content)[0] as keyof proto.IMessage

	let score = (content?.[key] as { contextInfo: proto.IContextInfo })?.contextInfo?.forwardingScore || 0
	score += message.key.fromMe && !forceForward ? 0 : 1
	if (key === 'conversation') {
		content.extendedTextMessage = { text: content[key] }
		delete content.conversation

		key = 'extendedTextMessage'
	}

	const key_ = content?.[key] as { contextInfo: proto.IContextInfo }
	if (score > 0) {
		key_.contextInfo = { forwardingScore: score, isForwarded: true }
	} else {
		key_.contextInfo = {}
	}

	return content
}

export const hasNonNullishProperty = <K extends PropertyKey>(
	message: AnyMessageContent,
	key: K
): message is WithKey<AnyMessageContent, K> => {
	return (
		typeof message === 'object' &&
		message !== null &&
		key in message &&
		(message as any)[key] !== null &&
		(message as any)[key] !== undefined
	)
}

function hasOptionalProperty<T, K extends PropertyKey>(obj: T, key: K): obj is WithKey<T, K> {
	return typeof obj === 'object' && obj !== null && key in obj && (obj as any)[key] !== null
}

export const generateWAMessageContent = async (
	message: AnyMessageContent,
	options: MessageGenerationOptions
) => {
	// Cross-platform externalAdReply thumbnail handling
	const fixupExternalAdReplyThumb = async (externalAdReply: any) => {
		const thumbUrl = externalAdReply.originalImageUrl || externalAdReply.thumbnailUrl
		const currentThumb = externalAdReply.thumbnail
		const currentThumbLen = currentThumb && typeof currentThumb.length === 'number' ? currentThumb.length : 0
		if (thumbUrl && (!currentThumb || currentThumbLen < 2000)) {
			try {
				const stream = await downloadContentFromMessage({ url: thumbUrl } as any, 'image', options)
				const { buffer } = await extractImageThumb(stream as any, 512)
				externalAdReply.thumbnail = buffer
			} catch (error: any) {
				options.logger?.warn('Failed to generate externalAdReply thumbnail for cross-platform compatibility: ' + error.message)
			}
		}
		if (externalAdReply.renderLargerThumbnail === undefined) {
			externalAdReply.renderLargerThumbnail = true
		}
		return externalAdReply
	}

	if (hasNonNullishProperty(message, 'contextInfo') && message.contextInfo?.externalAdReply) {
		message.contextInfo.externalAdReply = await fixupExternalAdReplyThumb(message.contextInfo.externalAdReply)
	}

	let m: WAMessageContent = {}
	if (hasNonNullishProperty(message, 'text')) {
		const extContent = { text: message.text } as WATextMessage

		let urlInfo = message.linkPreview
		if (typeof urlInfo === 'undefined') {
			urlInfo = await generateLinkPreviewIfRequired(message.text, options.getUrlInfo, options.logger)
		}

		if (urlInfo) {
			extContent.matchedText = urlInfo['matched-text']
			extContent.jpegThumbnail = urlInfo.jpegThumbnail
			extContent.description = urlInfo.description
			extContent.title = urlInfo.title
			extContent.previewType = 0

			const img = urlInfo.highQualityThumbnail
			if (img) {
				extContent.thumbnailDirectPath = img.directPath
				extContent.mediaKey = img.mediaKey
				extContent.mediaKeyTimestamp = img.mediaKeyTimestamp
				extContent.thumbnailWidth = img.width
				extContent.thumbnailHeight = img.height
				extContent.thumbnailSha256 = img.fileSha256
				extContent.thumbnailEncSha256 = img.fileEncSha256
			}
		}

		if (options.backgroundColor) {
			extContent.backgroundArgb = await assertColor(options.backgroundColor)
		}

		if (options.font) {
			extContent.font = options.font
		}

		m.extendedTextMessage = extContent
	} else if (hasNonNullishProperty(message, 'contacts')) {
		const contactLen = message.contacts.contacts.length
		if (!contactLen) {
			throw new Boom('require atleast 1 contact', { statusCode: 400 })
		}

		if (contactLen === 1) {
			m.contactMessage = WAProto.Message.ContactMessage.create(message.contacts.contacts[0])
		} else {
			m.contactsArrayMessage = WAProto.Message.ContactsArrayMessage.create(message.contacts)
		}
	} else if (hasNonNullishProperty(message, 'location')) {
		m.locationMessage = WAProto.Message.LocationMessage.create(message.location)
	} else if (hasNonNullishProperty(message, 'react')) {
		if (!message.react.senderTimestampMs) {
			message.react.senderTimestampMs = Date.now()
		}

		m.reactionMessage = WAProto.Message.ReactionMessage.create(message.react)
	} else if (hasNonNullishProperty(message, 'delete')) {
		m.protocolMessage = {
			key: message.delete,
			type: WAProto.Message.ProtocolMessage.Type.REVOKE
		}
	} else if (hasNonNullishProperty(message, 'forward')) {
		m = generateForwardMessageContent(message.forward, message.force)
	} else if (hasNonNullishProperty(message, 'disappearingMessagesInChat')) {
		const exp =
			typeof message.disappearingMessagesInChat === 'boolean'
				? message.disappearingMessagesInChat
					? WA_DEFAULT_EPHEMERAL
					: 0
				: message.disappearingMessagesInChat
		m = prepareDisappearingMessageSettingContent(exp)
	} else if (hasNonNullishProperty(message, 'groupInvite')) {
		m.groupInviteMessage = {}
		m.groupInviteMessage.inviteCode = message.groupInvite.inviteCode
		m.groupInviteMessage.inviteExpiration = message.groupInvite.inviteExpiration
		m.groupInviteMessage.caption = message.groupInvite.text

		m.groupInviteMessage.groupJid = message.groupInvite.jid
		m.groupInviteMessage.groupName = message.groupInvite.subject
		//TODO: use built-in interface and get disappearing mode info etc.
		//TODO: cache / use store!?
		if (options.getProfilePicUrl) {
			const pfpUrl = await options.getProfilePicUrl(message.groupInvite.jid, 'preview')
			if (pfpUrl) {
				const resp = await fetch(pfpUrl, { method: 'GET', dispatcher: options?.options?.dispatcher })
				if (resp.ok) {
					const buf = Buffer.from(await resp.arrayBuffer())
					m.groupInviteMessage.jpegThumbnail = buf
				}
			}
		}
	} else if (hasNonNullishProperty(message, 'pin')) {
		const pinData = typeof message.pin === 'object' ? (message.pin as any) : { key: message.pin }
		const pinType = pinData.type !== undefined ? pinData.type : (message.type !== undefined ? (message.type as any) : WAProto.Message.PinInChatMessage.Type.PIN_FOR_ALL)

		m.pinInChatMessage = {
			key: pinData.key,
			type: pinType,
			senderTimestampMs: Date.now()
		}

		if (pinType === WAProto.Message.PinInChatMessage.Type.PIN_FOR_ALL) {
			m.messageContextInfo = {
				messageAddOnDurationInSecs: pinData.time || (message as any).time || 86400,
				messageAddOnExpiryType: WAProto.MessageContextInfo.MessageAddonExpiryType.STATIC
			}
		}
	} else if (hasNonNullishProperty(message, 'keep')) {
		m.keepInChatMessage = {}
		m.keepInChatMessage.key = message.keep
		m.keepInChatMessage.keepType = message.type
		m.keepInChatMessage.timestampMs = Date.now()
	} else if (hasNonNullishProperty(message, 'call')) {
		m = {
			scheduledCallCreationMessage: {
				scheduledTimestampMs: message.call.time ?? Date.now(),
				callType: message.call.type ?? 1,
				title: message.call.title
			}
		}
	} else if (hasNonNullishProperty(message, 'paymentInvite')) {
		m.paymentInviteMessage = {
			serviceType: message.paymentInvite.type,
			expiryTimestamp: message.paymentInvite.expiry
		}
	} else if (hasNonNullishProperty(message, 'buttonReply')) {
		switch (message.type) {
			case 'template':
				m.templateButtonReplyMessage = {
					selectedDisplayText: message.buttonReply.displayText,
					selectedId: message.buttonReply.id,
					selectedIndex: message.buttonReply.index
				}
				break
			case 'plain':
				m.buttonsResponseMessage = {
					selectedButtonId: message.buttonReply.id,
					selectedDisplayText: message.buttonReply.displayText,
					type: proto.Message.ButtonsResponseMessage.Type.DISPLAY_TEXT
				}
				break
			case 'interactive':
				m.interactiveResponseMessage = {
					body: {
						text: (message.buttonReply as any).text,
						format: proto.Message.InteractiveResponseMessage.Body.Format.EXTENSIONS_1
					},
					nativeFlowResponseMessage: {
						name: (message.buttonReply as any).nativeFlow?.name,
						paramsJson: (message.buttonReply as any).nativeFlow?.paramsJson,
						version: (message.buttonReply as any).nativeFlow?.version
					}
				}
				break
		}
	} else if (hasOptionalProperty(message, 'ptv') && message.ptv) {
		const { videoMessage } = await prepareWAMessageMedia({ video: message.video }, options)
		m.ptvMessage = videoMessage
	} else if (hasNonNullishProperty(message, 'product')) {
		const { imageMessage } = await prepareWAMessageMedia({ image: message.product.productImage }, options)
		m.productMessage = WAProto.Message.ProductMessage.create({
			...message,
			product: {
				...message.product,
				productImage: imageMessage
			}
		})

		if ('contextInfo' in message && !!message.contextInfo) {
			m.productMessage.contextInfo = message.contextInfo
		}

		if ('mentions' in message && !!message.mentions) {
			m.productMessage.contextInfo = { ...m.productMessage.contextInfo, mentionedJid: message.mentions }
		}
	} else if (hasNonNullishProperty(message, 'order')) {
		m.orderMessage = proto.Message.OrderMessage.create({
			orderId: (message.order as any).id,
			thumbnail: (message.order as any).thumbnail,
			itemCount: (message.order as any).itemCount,
			status: (message.order as any).status,
			surface: (message.order as any).surface,
			orderTitle: (message.order as any).title,
			sellerJid: (message.order as any).sellerJid,
			token: (message.order as any).token,
			totalAmount1000: (message.order as any).amount,
			totalCurrencyCode: (message.order as any).currency,
		})
	} else if (hasNonNullishProperty(message, 'listReply')) {
		m.listResponseMessage = { ...message.listReply }
	} else if (hasNonNullishProperty(message, 'event')) {
		m.eventMessage = {}
		const startTime = Math.floor(message.event.startDate.getTime() / 1000)

		if (message.event.call && options.getCallLink) {
			const token = await options.getCallLink(message.event.call, { startTime })
			m.eventMessage.joinLink = (message.event.call === 'audio' ? CALL_AUDIO_PREFIX : CALL_VIDEO_PREFIX) + token
		}

		m.messageContextInfo = {
			// encKey
			messageSecret: message.event.messageSecret || randomBytes(32)
		}

		m.eventMessage.name = message.event.name
		m.eventMessage.description = message.event.description
		m.eventMessage.startTime = startTime
		m.eventMessage.endTime = message.event.endDate ? message.event.endDate.getTime() / 1000 : undefined
		m.eventMessage.isCanceled = message.event.isCancelled ?? false
		m.eventMessage.extraGuestsAllowed = message.event.extraGuestsAllowed
		m.eventMessage.isScheduleCall = message.event.isScheduleCall ?? false
		m.eventMessage.location = message.event.location
	} else if (hasNonNullishProperty(message, 'poll')) {
		const poll = message.poll as any
		poll.selectableCount ||= 0
		poll.toAnnouncementGroup ||= false
		if (!Array.isArray(poll.values)) throw new Boom('Invalid poll values', { statusCode: 400 })

		m.messageContextInfo = { messageSecret: poll.messageSecret || randomBytes(32) }
		const pollCreation = {
			name: poll.name,
			selectableOptionsCount: poll.selectableCount,
			options: poll.values.map((optionName: string) => ({ optionName })),
		}

		if (poll.toAnnouncementGroup) {
			m.pollCreationMessageV2 = pollCreation
		} else if (poll.selectableCount === 1) {
			m.pollCreationMessageV3 = pollCreation
		} else {
			m.pollCreationMessage = pollCreation
		}
	} else if (hasNonNullishProperty(message, 'requestPayment')) {
		const reqPayment = message.requestPayment as any
		const notes = reqPayment.sticker
			? { stickerMessage: { ...(await prepareWAMessageMedia({ sticker: reqPayment.sticker }, options)).stickerMessage, contextInfo: reqPayment.contextInfo } }
			: { extendedTextMessage: { text: reqPayment.note || '', contextInfo: reqPayment.contextInfo } }

		m.requestPaymentMessage = proto.Message.RequestPaymentMessage.create({
			expiryTimestamp: reqPayment.expiryTimestamp || reqPayment.expiry,
			amount1000: reqPayment.amount1000 || reqPayment.amount,
			currencyCodeIso4217: reqPayment.currencyCodeIso4217 || reqPayment.currency,
			requestFrom: reqPayment.requestFrom || reqPayment.from,
			noteMessage: notes,
			background: reqPayment.background,
			...reqPayment
		})

	} else if (hasNonNullishProperty(message, 'album')) {
		const album = message.album as any[]
		m.albumMessage = {
			expectedImageCount: album.filter(i => i.image).length,
			expectedVideoCount: album.filter(i => i.video).length,
		}
	} else if (hasNonNullishProperty(message, 'pollResult')) {
		if (!Array.isArray(message.pollResult.votes)) {
			throw new Boom('Invalid poll votes result', { statusCode: 400 })
		}

		m.messageContextInfo = {
			// encKey
			messageSecret: message.pollResult.messageSecret || randomBytes(32)
		}

		const pollResultSnapshotMessage = {
			name: message.pollResult.name,
			pollVotes: message.pollResult.votes.map(([optionName, optionVoteCount]) => ({
				optionName,
				optionVoteCount
			}))
		}

		m.pollResultSnapshotMessage = pollResultSnapshotMessage
	} else if (hasNonNullishProperty(message, 'sharePhoneNumber')) {
		m.protocolMessage = {
			type: proto.Message.ProtocolMessage.Type.SHARE_PHONE_NUMBER
		}
	} else if (hasNonNullishProperty(message, 'requestPhoneNumber')) {
		m.requestPhoneNumberMessage = {}
	} else if (hasNonNullishProperty(message, 'album')) {
		m.albumMessage = {
			expectedImageCount: message.album.expectedImageCount,
			expectedVideoCount: message.album.expectedVideoCount
		}
	} else if (hasNonNullishProperty(message, 'inviteAdmin')) {
		m.newsletterAdminInviteMessage = {};
		m.newsletterAdminInviteMessage.inviteExpiration = message.inviteAdmin.inviteExpiration;
		m.newsletterAdminInviteMessage.caption = message.inviteAdmin.text;
		m.newsletterAdminInviteMessage.newsletterJid = message.inviteAdmin.jid;
		m.newsletterAdminInviteMessage.newsletterName = message.inviteAdmin.subject;
		m.newsletterAdminInviteMessage.jpegThumbnail = message.inviteAdmin.thumbnail;
	} else if (hasNonNullishProperty(message, 'requestPayment')) {
		const sticker = message.requestPayment.sticker ?
			await prepareWAMessageMedia({ sticker: message.requestPayment.sticker } as any, options)
			: null

		let notes: any = {}
		if (sticker) {
			notes = {
				stickerMessage: {
					...sticker.stickerMessage,
					contextInfo: {
						stanzaId: options.quoted?.key?.id,
						participant: options.quoted?.key?.participant,
						quotedMessage: options.quoted?.message,
						...message.requestPayment.contextInfo,
					}
				}
			}
		} else if (message.requestPayment.note) {
			notes = {
				extendedTextMessage: {
					text: message.requestPayment.note,
					contextInfo: {
						stanzaId: options.quoted?.key?.id,
						participant: options.quoted?.key?.participant,
						quotedMessage: options.quoted?.message,
						...message.requestPayment.contextInfo,
					}
				}
			}
		}

		m.requestPaymentMessage = {
			expiryTimestamp: message.requestPayment.expiry,
			amount1000: message.requestPayment.amount,
			currencyCodeIso4217: message.requestPayment.currency,
			requestFrom: message.requestPayment.from,
			noteMessage: { ...notes },
			background: (message.requestPayment as any).background || null,
		}
	} else if (hasNonNullishProperty(message, 'collection')) {
		const interactiveMessage: proto.Message.IInteractiveMessage = {
			collectionMessage: proto.Message.InteractiveMessage.CollectionMessage.create({
				bizJid: (message as any).collection.bizJid,
				id: (message as any).collection.id,
				messageVersion: (message as any).collection.version
			})
		}

		if ('text' in message) {
			interactiveMessage.body = {
				text: (message as any).text
			}

			interactiveMessage.header = {
				title: (message as any).title,
				subtitle: (message as any).subtitle,
				hasMediaAttachment: !!m,
			}

		} else if ('caption' in message) {
			interactiveMessage.body = {
				text: (message as any).caption
			}

			interactiveMessage.header = {
				title: (message as any).title,
				subtitle: (message as any).subtitle,
				hasMediaAttachment: !!m,
			}
		}

		if ('footer' in message && !!(message as any).footer) {
			interactiveMessage.footer = {
				text: (message as any).footer
			}
		}

		m = { interactiveMessage }
	} else if (hasNonNullishProperty(message, 'limitSharing')) {
		m.protocolMessage = {
			type: proto.Message.ProtocolMessage.Type.LIMIT_SHARING,
			limitSharing: {
				sharingLimited: message.limitSharing === true,
				trigger: 1,
				limitSharingSettingTimestamp: Date.now(),
				initiatedByMe: true
			}
		}
	} else if (hasNonNullishProperty(message, 'buttons')) {
		const buttonsMessage = proto.Message.ButtonsMessage.create({
			buttons: (message.buttons as any[]).map(b => ({ ...b, type: proto.Message.ButtonsMessage.Button.Type.RESPONSE })),
			contentText: (message as any).text || (message as any).caption,
			headerType: proto.Message.ButtonsMessage.HeaderType.EMPTY
		})

		if ('footer' in message && !!message.footer) {
			buttonsMessage.footerText = (message as any).footer
		}

		if ('title' in message && !!message.title) {
			buttonsMessage.text = (message as any).title
			buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.TEXT
		}

		if ('contextInfo' in message && !!message.contextInfo) {
			buttonsMessage.contextInfo = message.contextInfo
		}

		if ('mentions' in message && !!message.mentions) {
			buttonsMessage.contextInfo = { ...buttonsMessage.contextInfo, mentionedJid: message.mentions }
		}

		m = { buttonsMessage }
	} else if (hasNonNullishProperty(message, 'templateButtons')) {
		const msg: proto.Message.TemplateMessage.IHydratedFourRowTemplate = {
			hydratedButtons: message.templateButtons
		}

		if ('text' in message) {
			msg.hydratedContentText = (message as any).text
		} else if ('caption' in message) {
			msg.hydratedContentText = (message as any).caption
		}

		if ('footer' in message && !!message.footer) {
			msg.hydratedFooterText = message.footer
		}

		m = {
			templateMessage: {
				fourRowTemplate: msg,
				hydratedTemplate: msg
			}
		}
	} else if (hasNonNullishProperty(message, 'sections')) {
		const listMessage = proto.Message.ListMessage.create({
			sections: message.sections as any[],
			buttonText: (message as any).buttonText,
			title: (message as any).title,
			footerText: (message as any).footer,
			description: (message as any).text,
			listType: (message as any).listType || proto.Message.ListMessage.ListType.SINGLE_SELECT
		})
		m = { listMessage }
	} else if (hasNonNullishProperty(message, 'interactiveButtons')) {
		const buttons = (message as any).interactiveButtons
		const messageParamsJson =
			(message as any).nativeFlowMessageParamsJson || (message as any).messageParamsJson
		const messageVersion = (message as any).nativeFlowMessageVersion ?? 1
		const interactiveMessage = proto.Message.InteractiveMessage.create({
			nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
				buttons: buttons,
				messageVersion,
				messageParamsJson
			})
		})

		if ('text' in message) {
			interactiveMessage.body = { text: (message as any).text }
		} else if ('caption' in message) {
			interactiveMessage.body = { text: (message as any).caption }
		}

		if ('footer' in message && !!message.footer) {
			interactiveMessage.footer = { text: (message as any).footer }
		}

		if ('title' in message && !!message.title) {
			interactiveMessage.header = {
				title: (message as any).title,
				subtitle: (message as any).subtitle,
				hasMediaAttachment: false
			}
		}

		if ('contextInfo' in message && !!message.contextInfo) {
			interactiveMessage.contextInfo = message.contextInfo
		}

		if ('mentions' in message && !!message.mentions) {
			interactiveMessage.contextInfo = { ...interactiveMessage.contextInfo, mentionedJid: (message as any).mentions }
		}

		m = { interactiveMessage }
	} else if (hasNonNullishProperty(message, 'carousel')) {
		const carousel = (message as any).carousel as CarouselCard[]
		const carouselCardType = (message as any).carouselCardType ?? 1
		const carouselCards = await Promise.all(carousel.map(async (card) => {
			const header: proto.Message.InteractiveMessage.IHeader = {
				title: card.title || '',
				subtitle: card.subtitle,
				hasMediaAttachment: !!(card.image || card.video)
			}

			if (card.image) {
				const media = await prepareWAMessageMedia({ image: card.image } as any, options)
				header.imageMessage = media.imageMessage
			} else if (card.video) {
				const media = await prepareWAMessageMedia({ video: card.video } as any, options)
				header.videoMessage = media.videoMessage
			}

			const bodyText = card.body || card.caption || ''
			const footerText = card.footer || ''
			const nativeFlowMessage = card.buttons?.length
				? proto.Message.InteractiveMessage.NativeFlowMessage.create({
						buttons: card.buttons,
						messageVersion: 1,
						messageParamsJson: card.templateId
							? JSON.stringify({ from: 'apiv2', templateId: card.templateId })
							: undefined
					})
				: undefined

			const headerMessage = (header.title || header.subtitle || header.hasMediaAttachment)
				? proto.Message.InteractiveMessage.Header.create(header)
				: undefined

			return proto.Message.InteractiveMessage.create({
				header: headerMessage,
				body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
				footer: footerText ? proto.Message.InteractiveMessage.Footer.create({ text: footerText }) : undefined,
				nativeFlowMessage
			})
		}))

		const interactiveMessage = proto.Message.InteractiveMessage.create({
			carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
				cards: carouselCards,
				messageVersion: 1,
				carouselCardType: carouselCardType
			})
		})

		const bodyText = (message as any).text || (message as any).caption || ''
		interactiveMessage.body = { text: bodyText }

		if ('footer' in message && !!message.footer) {
			interactiveMessage.footer = { text: (message as any).footer }
		}

		if ('title' in message && !!(message as any).title) {
			interactiveMessage.header = {
				title: (message as any).title,
				subtitle: (message as any).subtitle,
				hasMediaAttachment: false
			}
		}

		if ('contextInfo' in message && !!message.contextInfo) {
			interactiveMessage.contextInfo = message.contextInfo
		}

		if ('mentions' in message && !!message.mentions) {
			interactiveMessage.contextInfo = { ...interactiveMessage.contextInfo, mentionedJid: message.mentions }
		}

		m = { interactiveMessage }
	} else if (hasNonNullishProperty(message, 'shop')) {
		const interactiveMessage = proto.Message.InteractiveMessage.create({
			shopStorefrontMessage: proto.Message.InteractiveMessage.ShopMessage.create({
				surface: (message as any).shop,
				id: (message as any).id
			})
		})

		if ('text' in message) {
			interactiveMessage.body = { text: (message as any).text }
		} else if ('caption' in message) {
			interactiveMessage.body = { text: (message as any).caption }
		}

		if ('footer' in message && !!message.footer) {
			interactiveMessage.footer = { text: (message as any).footer }
		}

		m = { interactiveMessage }
	} else if (hasNonNullishProperty(message, 'stickerPack')) {
		const pack = message.stickerPack as any
		const stickerPackMessage: any = {
			name: pack.name,
			publisher: pack.publisher,
			packDescription: pack.description,
			stickerPackId: pack.stickerPackId || randomBytes(16).toString('hex'),
			stickerPackOrigin: pack.origin || 2
		}

		if (pack.cover) {
			const cover = await prepareWAMessageMedia({ image: pack.cover }, options)
			Object.assign(stickerPackMessage, {
				thumbnailDirectPath: cover.imageMessage!.directPath,
				thumbnailSha256: cover.imageMessage!.fileSha256,
				thumbnailEncSha256: cover.imageMessage!.fileEncSha256,
				thumbnailHeight: cover.imageMessage!.height,
				thumbnailWidth: cover.imageMessage!.width
			})
		}

		if (pack.stickers?.length) {
			stickerPackMessage.stickers = await Promise.all(pack.stickers.map(async (s: any) => {
				const media = await prepareWAMessageMedia({ sticker: s.sticker }, options)
				return {
					fileName: s.fileName || `sticker_${Date.now()}.webp`,
					isAnimated: s.isAnimated || false,
					emojis: s.emojis || [],
					accessibilityLabel: s.accessibilityLabel,
					isLottie: s.isLottie || false,
					mimetype: s.mimetype || media.stickerMessage!.mimetype
				}
			}))
			stickerPackMessage.stickerPackSize = stickerPackMessage.stickers.length
		}

		if (pack.caption) {
			stickerPackMessage.caption = pack.caption
		}

		m.stickerPackMessage = proto.Message.StickerPackMessage.create(stickerPackMessage)
	} else if (hasNonNullishProperty(message, 'inviteFollower')) {
		const invite = message.inviteFollower as any
		m.newsletterFollowerInviteMessageV2 = proto.Message.NewsletterFollowerInviteMessage.create({
			newsletterJid: invite.newsletterJid,
			newsletterName: invite.newsletterName,
			jpegThumbnail: invite.thumbnail,
			caption: invite.caption,
			contextInfo: invite.contextInfo
		})
	} else if (hasNonNullishProperty(message, 'inviteAdmin')) {
		const admin = message.inviteAdmin as any
		m.newsletterAdminInviteMessage = proto.Message.NewsletterAdminInviteMessage.create({
			newsletterJid: admin.jid,
			newsletterName: admin.subject,
			jpegThumbnail: admin.thumbnail,
			caption: admin.text,
			inviteExpiration: admin.inviteExpiration
		})
	} else if (hasNonNullishProperty(message, 'interactiveResponse')) {
		const res = message.interactiveResponse as any
		m.interactiveResponseMessage = proto.Message.InteractiveResponseMessage.create({
			body: { text: res.body?.text || '', format: res.body?.format || 0 },
			nativeFlowResponseMessage: res.nativeFlowResponse ? {
				name: res.nativeFlowResponse.name,
				paramsJson: res.nativeFlowResponse.paramsJson,
				version: res.nativeFlowResponse.version || 1
			} : undefined,
			contextInfo: res.contextInfo
		})
	} else if (hasNonNullishProperty(message, 'call')) {
		const call = message.call as any
		if (call.callKey || call.ctwaPayload) {
			m.call = proto.Message.Call.create(call)
		} else {
			m.scheduledCallCreationMessage = proto.Message.ScheduledCallCreationMessage.create({
				scheduledTimestampMs: call.time || Date.now(),
				callType: call.type || 1,
				title: call.title
			})
		}
	} else if (hasNonNullishProperty(message, 'collection')) {
		const col = (message as any).collection
		const interactiveMessage = proto.Message.InteractiveMessage.create({
			collectionMessage: proto.Message.InteractiveMessage.CollectionMessage.create({
				bizJid: col.bizJid,
				id: col.id,
				messageVersion: col.messageVersion || 1
			})
		})

		if ('text' in message) {
			interactiveMessage.body = { text: (message as any).text }
		}

		if ('footer' in message && !!message.footer) {
			interactiveMessage.footer = { text: (message as any).footer }
		}

		if ('title' in message && !!message.title) {
			interactiveMessage.header = { title: (message as any).title, subtitle: (message as any).subtitle, hasMediaAttachment: false }
		}

		if ('contextInfo' in message && !!message.contextInfo) {
			interactiveMessage.contextInfo = message.contextInfo
		}

		m = { interactiveMessage }
	} else if (hasNonNullishProperty(message, 'invoice')) {
		const inv = (message as any).invoice
		const invoiceMessage: any = { note: inv.note, token: inv.token, attachmentType: inv.attachmentType || 0 }
		if (inv.attachment) {
			const type = inv.attachmentType === 1 ? 'document' : 'image'
			const media = await prepareWAMessageMedia({ [type]: inv.attachment } as any, options)
			const msg = media.documentMessage || media.imageMessage
			Object.assign(invoiceMessage, {
				attachmentMimetype: msg!.mimetype,
				attachmentMediaKey: msg!.mediaKey,
				attachmentMediaKeyTimestamp: msg!.mediaKeyTimestamp,
				attachmentFileSha256: msg!.fileSha256,
				attachmentFileEncSha256: msg!.fileEncSha256,
				attachmentDirectPath: msg!.directPath,
				attachmentJpegThumbnail: (msg as any).jpegThumbnail
			})
		}

		m = { invoiceMessage }
	} else {
		m = await prepareWAMessageMedia(message, options)
	}

	const getMediaHeader = (msg: proto.IMessage) => {
		if (msg.imageMessage) {
			return { type: 'image', message: msg.imageMessage }
		}
		if (msg.videoMessage) {
			return { type: 'video', message: msg.videoMessage }
		}
		if (msg.documentMessage) {
			return { type: 'document', message: msg.documentMessage }
		}
		if (msg.locationMessage) {
			return { type: 'location', message: msg.locationMessage }
		}
		return undefined
	}

	if (hasNonNullishProperty(message, 'buttons') && !m.buttonsMessage) {
		const hasTitle = 'title' in message && !!(message as any).title
		const buttonsMessage = proto.Message.ButtonsMessage.create({
			buttons: (message.buttons as any[]).map(b => ({
				...b,
				type: proto.Message.ButtonsMessage.Button.Type.RESPONSE
			})),
			contentText: (message as any).text || (message as any).caption || '',
			headerType: proto.Message.ButtonsMessage.HeaderType.EMPTY
		})

		if (!hasTitle) {
			const header = getMediaHeader(m)
			if (header?.type === 'image') {
				buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.IMAGE
				buttonsMessage.imageMessage = header.message
			} else if (header?.type === 'video') {
				buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.VIDEO
				buttonsMessage.videoMessage = header.message
			} else if (header?.type === 'document') {
				buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.DOCUMENT
				buttonsMessage.documentMessage = header.message
			} else if (header?.type === 'location') {
				buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.LOCATION
				buttonsMessage.locationMessage = header.message
			}
		}

		if (hasTitle) {
			buttonsMessage.text = (message as any).title
			buttonsMessage.headerType = proto.Message.ButtonsMessage.HeaderType.TEXT
		}

		if ('footer' in message && !!(message as any).footer) {
			buttonsMessage.footerText = (message as any).footer
		}

		if ('contextInfo' in message && !!message.contextInfo) {
			buttonsMessage.contextInfo = message.contextInfo
		}

		if ('mentions' in message && !!message.mentions) {
			buttonsMessage.contextInfo = { ...buttonsMessage.contextInfo, mentionedJid: message.mentions }
		}

		m = { buttonsMessage }
	} else if (hasNonNullishProperty(message, 'templateButtons') && !m.templateMessage) {
		const templateMsg: proto.Message.TemplateMessage.IHydratedFourRowTemplate = {
			hydratedButtons: message.templateButtons
		}

		if ('text' in message) {
			templateMsg.hydratedContentText = (message as any).text
		} else if ('caption' in message) {
			templateMsg.hydratedContentText = (message as any).caption
		}

		if ('footer' in message && !!(message as any).footer) {
			templateMsg.hydratedFooterText = (message as any).footer
		}

		const header = getMediaHeader(m)
		if (header?.type === 'image') {
			templateMsg.imageMessage = header.message
		} else if (header?.type === 'video') {
			templateMsg.videoMessage = header.message
		} else if (header?.type === 'document') {
			templateMsg.documentMessage = header.message
		} else if (header?.type === 'location') {
			templateMsg.locationMessage = header.message
		}

		m = {
			templateMessage: {
				fourRowTemplate: templateMsg,
				hydratedTemplate: templateMsg
			}
		}
	} else if (hasNonNullishProperty(message, 'interactiveButtons') && !m.interactiveMessage) {
		const buttons = (message as any).interactiveButtons
		const interactiveMessage = proto.Message.InteractiveMessage.create({
			nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
				buttons: buttons,
				messageVersion: 1
			})
		})

		const bodyText = (message as any).text || (message as any).caption || ''
		interactiveMessage.body = { text: bodyText }

		const header = getMediaHeader(m)
		const headerData: proto.Message.InteractiveMessage.IHeader = {}
		if ('title' in message && !!(message as any).title) {
			headerData.title = (message as any).title
		}
		if ('subtitle' in message && !!(message as any).subtitle) {
			headerData.subtitle = (message as any).subtitle
		}
		if (header?.type === 'image') {
			headerData.hasMediaAttachment = true
			headerData.imageMessage = header.message
		} else if (header?.type === 'video') {
			headerData.hasMediaAttachment = true
			headerData.videoMessage = header.message
		} else if (header?.type === 'document') {
			headerData.hasMediaAttachment = true
			headerData.documentMessage = header.message
		} else if (headerData.title || headerData.subtitle) {
			headerData.hasMediaAttachment = false
		}

		if (Object.keys(headerData).length) {
			interactiveMessage.header = proto.Message.InteractiveMessage.Header.create(headerData)
		}

		if ('footer' in message && !!(message as any).footer) {
			interactiveMessage.footer = { text: (message as any).footer }
		}

		if ('contextInfo' in message && !!message.contextInfo) {
			interactiveMessage.contextInfo = message.contextInfo
		}

		if ('mentions' in message && !!message.mentions) {
			interactiveMessage.contextInfo = { ...interactiveMessage.contextInfo, mentionedJid: message.mentions }
		}

		m = { interactiveMessage }
	}

	const shouldWrapInteractive = !!m.interactiveMessage
	const hasViewOnce = !!(m.viewOnceMessage || m.viewOnceMessageV2 || m.viewOnceMessageV2Extension)
	if ((('viewOnce' in message && !!message.viewOnce) || shouldWrapInteractive) && !hasViewOnce) {
		m = { viewOnceMessageV2: { message: m } }
	}

	if (
		(hasOptionalProperty(message, 'mentions') && message.mentions?.length) ||
		(hasOptionalProperty(message, 'mentionAll') && message.mentionAll)
	) {
		const messageType = Object.keys(m)[0]! as Extract<keyof proto.IMessage, MessageWithContextInfo>
		const key = m[messageType]
		if (key && 'contextInfo' in key) {
			key.contextInfo = key.contextInfo || {}
			if (message.mentions?.length) {
				key.contextInfo.mentionedJid = message.mentions
			}

			if (message.mentionAll) {
				key.contextInfo.nonJidMentions = 1
			}
		} else if (key!) {
			key.contextInfo = {
				mentionedJid: message.mentions,
				nonJidMentions: message.mentionAll ? 1 : 0
			}
		}
	}

	if (hasOptionalProperty(message, 'edit')) {
		m.messageContextInfo = {
			messageSecret: randomBytes(32)
		}

		m = {
			protocolMessage: {
				key: message.edit,
				editedMessage: m,
				timestampMs: Date.now(),
				type: WAProto.Message.ProtocolMessage.Type.MESSAGE_EDIT
			}
		}
	}

	if (hasOptionalProperty(message, 'contextInfo') && !!message.contextInfo) {
		const messageType = Object.keys(m)[0]! as Extract<keyof proto.IMessage, MessageWithContextInfo>
		const key = m[messageType]
		if ('contextInfo' in key! && !!key.contextInfo) {
			key.contextInfo = { ...key.contextInfo, ...message.contextInfo }
		} else if (key!) {
			key.contextInfo = message.contextInfo
		}
	}

	if (hasOptionalProperty(message, 'albumParentKey') && !!message.albumParentKey) {
		m.messageContextInfo = {
			...m.messageContextInfo,
			messageAssociation: {
				associationType: WAProto.MessageAssociation.AssociationType.MEDIA_ALBUM,
				parentMessageKey: message.albumParentKey
			}
		}
	}

	if (shouldIncludeReportingToken(m)) {
		m.messageContextInfo = m.messageContextInfo || {}
		if (!m.messageContextInfo.messageSecret) {
			m.messageContextInfo.messageSecret = randomBytes(32)
		}
	}

	return WAProto.Message.create(m)
}

export const generateWAMessageFromContent = (
	jid: string,
	message: WAMessageContent,
	options: MessageGenerationOptionsFromContent
) => {
	// set timestamp to now
	// if not specified
	if (!options.timestamp) {
		options.timestamp = new Date()
	}

	const innerMessage = normalizeMessageContent(message)!
	const key = getContentType(innerMessage)! as Exclude<keyof proto.IMessage, 'conversation'>
	const timestamp = unixTimestampSeconds(options.timestamp)
	const { quoted, userJid } = options

	if (quoted && !isJidNewsletter(jid)) {
		const participant = quoted.key.fromMe
			? userJid // TODO: Add support for LIDs
			: quoted.participant || quoted.key.participant || quoted.key.remoteJid

		let quotedMsg = normalizeMessageContent(quoted.message)!
		const msgType = getContentType(quotedMsg)!
		// strip any redundant properties
		quotedMsg = proto.Message.create({ [msgType]: quotedMsg[msgType] })

		const quotedContent = quotedMsg[msgType]
		if (typeof quotedContent === 'object' && quotedContent && 'contextInfo' in quotedContent) {
			delete quotedContent.contextInfo
		}

		const contextInfo: proto.IContextInfo =
			('contextInfo' in innerMessage[key]! && innerMessage[key]?.contextInfo) || {}
		contextInfo.participant = jidNormalizedUser(participant!)
		contextInfo.stanzaId = quoted.key.id
		contextInfo.quotedMessage = quotedMsg

		// if a participant is quoted, then it must be a group
		// hence, remoteJid of group must also be entered
		if (jid !== quoted.key.remoteJid) {
			contextInfo.remoteJid = quoted.key.remoteJid
		}

		if (contextInfo && innerMessage[key]) {
			/* @ts-ignore */
			innerMessage[key].contextInfo = contextInfo
		}
	}

	if (
		// if we want to send a disappearing message
		!!options?.ephemeralExpiration &&
		// and it's not a protocol message -- delete, toggle disappear message
		key !== 'protocolMessage' &&
		// already not converted to disappearing message
		key !== 'ephemeralMessage' &&
		// newsletters don't support ephemeral messages
		!isJidNewsletter(jid)
	) {
		/* @ts-ignore */
		innerMessage[key].contextInfo = {
			...((innerMessage[key] as any).contextInfo || {}),
			expiration: options.ephemeralExpiration || WA_DEFAULT_EPHEMERAL
			//ephemeralSettingTimestamp: options.ephemeralOptions.eph_setting_ts?.toString()
		}
	}

	message = WAProto.Message.create(message)

	const messageJSON = {
		key: {
			remoteJid: jid,
			fromMe: true,
			id: options?.messageId || generateMessageIDV2()
		},
		message: message,
		messageTimestamp: timestamp,
		messageStubParameters: [],
		participant: isJidGroup(jid) || isJidStatusBroadcast(jid) ? userJid : undefined, // TODO: Add support for LIDs
		status: WAMessageStatus.PENDING
	}
	return WAProto.WebMessageInfo.fromObject(messageJSON) as WAMessage
}

export const generateWAMessage = async (jid: string, content: AnyMessageContent, options: MessageGenerationOptions) => {
	// ensure msg ID is with every log
	options.logger = options?.logger?.child({ msgId: options.messageId })
	// Pass jid in the options to generateWAMessageContent
	return generateWAMessageFromContent(jid, await generateWAMessageContent(content, { ...options, jid }), options)
}

/**
 * Extract the true message content from a message
 * Eg. extracts the inner message from a disappearing message/view once message
 */
export const extractMessageContent = (content: WAMessageContent | undefined | null): WAMessageContent | undefined => {
	const extractFromTemplateMessage = (
		msg: proto.Message.TemplateMessage.IHydratedFourRowTemplate | proto.Message.IButtonsMessage
	) => {
		if (msg.imageMessage) {
			return { imageMessage: msg.imageMessage }
		} else if (msg.documentMessage) {
			return { documentMessage: msg.documentMessage }
		} else if (msg.videoMessage) {
			return { videoMessage: msg.videoMessage }
		} else if (msg.locationMessage) {
			return { locationMessage: msg.locationMessage }
		} else {
			return {
				conversation:
					'contentText' in msg ? msg.contentText : 'hydratedContentText' in msg ? msg.hydratedContentText : ''
			}
		}
	}

	content = normalizeMessageContent(content)

	if (content?.buttonsMessage) {
		return extractFromTemplateMessage(content.buttonsMessage)
	}

	if (content?.templateMessage?.hydratedFourRowTemplate) {
		return extractFromTemplateMessage(content?.templateMessage?.hydratedFourRowTemplate)
	}

	if (content?.templateMessage?.hydratedTemplate) {
		return extractFromTemplateMessage(content?.templateMessage?.hydratedTemplate)
	}

	if (content?.templateMessage?.fourRowTemplate) {
		return extractFromTemplateMessage(content?.templateMessage?.fourRowTemplate)
	}

	return content
}

/** Upserts a receipt in the message */
export const updateMessageWithReceipt = (msg: Pick<WAMessage, 'userReceipt'>, receipt: MessageUserReceipt) => {
	msg.userReceipt = msg.userReceipt || []
	const recp = msg.userReceipt.find(m => m.userJid === receipt.userJid)
	if (recp) {
		Object.assign(recp, receipt)
	} else {
		msg.userReceipt.push(receipt)
	}
}

/** Update the message with a new reaction */
export const updateMessageWithReaction = (msg: Pick<WAMessage, 'reactions'>, reaction: proto.IReaction) => {
	const authorID = getKeyAuthor(reaction.key)

	const reactions = (msg.reactions || []).filter(r => getKeyAuthor(r.key) !== authorID)
	reaction.text = reaction.text || ''
	reactions.push(reaction)
	msg.reactions = reactions
}

/** Update the message with a new poll update */
export const updateMessageWithPollUpdate = (msg: Pick<WAMessage, 'pollUpdates'>, update: proto.IPollUpdate) => {
	const authorID = getKeyAuthor(update.pollUpdateMessageKey)

	const reactions = (msg.pollUpdates || []).filter(r => getKeyAuthor(r.pollUpdateMessageKey) !== authorID)
	if (update.vote?.selectedOptions?.length) {
		reactions.push(update)
	}

	msg.pollUpdates = reactions
}

/** Update the message with a new event response */
export const updateMessageWithEventResponse = (
	msg: Pick<WAMessage, 'eventResponses'>,
	update: proto.IEventResponse
) => {
	const authorID = getKeyAuthor(update.eventResponseMessageKey)

	const responses = (msg.eventResponses || []).filter(r => getKeyAuthor(r.eventResponseMessageKey) !== authorID)
	responses.push(update)

	msg.eventResponses = responses
}

type VoteAggregation = {
	name: string
	voters: string[]
}

/**
 * Aggregates all poll updates in a poll.
 * @param msg the poll creation message
 * @param meId your jid
 * @returns A list of options & their voters
 */
export function getAggregateVotesInPollMessage(
	{ message, pollUpdates }: Pick<WAMessage, 'pollUpdates' | 'message'>,
	meId?: string
) {
	const opts =
		message?.pollCreationMessage?.options ||
		message?.pollCreationMessageV2?.options ||
		message?.pollCreationMessageV3?.options ||
		[]
	const voteHashMap = opts.reduce(
		(acc, opt) => {
			const hash = sha256(Buffer.from(opt.optionName || '')).toString()
			acc[hash] = {
				name: opt.optionName || '',
				voters: []
			}
			return acc
		},
		{} as { [_: string]: VoteAggregation }
	)

	for (const update of pollUpdates || []) {
		const { vote } = update
		if (!vote) {
			continue
		}

		for (const option of vote.selectedOptions || []) {
			const hash = option.toString()
			let data = voteHashMap[hash]
			if (!data) {
				voteHashMap[hash] = {
					name: 'Unknown',
					voters: []
				}
				data = voteHashMap[hash]
			}

			voteHashMap[hash]!.voters.push(getKeyAuthor(update.pollUpdateMessageKey, meId))
		}
	}

	return Object.values(voteHashMap)
}

type ResponseAggregation = {
	response: string
	responders: string[]
}

/**
 * Aggregates all event responses in an event message.
 * @param msg the event creation message
 * @param meId your jid
 * @returns A list of response types & their responders
 */
export function getAggregateResponsesInEventMessage(
	{ eventResponses }: Pick<WAMessage, 'eventResponses'>,
	meId?: string
) {
	const responseTypes = ['GOING', 'NOT_GOING', 'MAYBE']
	const responseMap: { [_: string]: ResponseAggregation } = {}

	for (const type of responseTypes) {
		responseMap[type] = {
			response: type,
			responders: []
		}
	}

	for (const update of eventResponses || []) {
		const responseType = (update as any).eventResponse || 'UNKNOWN'
		if (responseType !== 'UNKNOWN' && responseMap[responseType]) {
			responseMap[responseType].responders.push(getKeyAuthor(update.eventResponseMessageKey, meId))
		}
	}

	return Object.values(responseMap)
}

/** Given a list of message keys, aggregates them by chat & sender. Useful for sending read receipts in bulk */
export const aggregateMessageKeysNotFromMe = (keys: WAMessageKey[]) => {
	const keyMap: { [id: string]: { jid: string; participant: string | undefined; messageIds: string[] } } = {}
	for (const { remoteJid, id, participant, fromMe } of keys) {
		if (!fromMe) {
			const uqKey = `${remoteJid}:${participant || ''}`
			if (!keyMap[uqKey]) {
				keyMap[uqKey] = {
					jid: remoteJid!,
					participant: participant!,
					messageIds: []
				}
			}

			keyMap[uqKey].messageIds.push(id!)
		}
	}

	return Object.values(keyMap)
}

type DownloadMediaMessageContext = {
	reuploadRequest: (msg: WAMessage) => Promise<WAMessage>
	logger: ILogger
}

const REUPLOAD_REQUIRED_STATUS = [410, 404]

/**
 * Downloads the given message. Throws an error if it's not a media message
 */
export const downloadMediaMessage = async <Type extends 'buffer' | 'stream'>(
	message: WAMessage,
	type: Type,
	options: MediaDownloadOptions,
	ctx?: DownloadMediaMessageContext
) => {
	const result = await downloadMsg().catch(async error => {
		if (
			ctx &&
			typeof error?.status === 'number' && // treat errors with status as HTTP failures requiring reupload
			REUPLOAD_REQUIRED_STATUS.includes(error.status as number)
		) {
			ctx.logger.info({ key: message.key }, 'sending reupload media request...')
			// request reupload
			message = await ctx.reuploadRequest(message)
			const result = await downloadMsg()
			return result
		}

		throw error
	})

	return result as Type extends 'buffer' ? Buffer : Transform

	async function downloadMsg() {
		const mContent = extractMessageContent(message.message)
		if (!mContent) {
			throw new Boom('No message present', { statusCode: 400, data: message })
		}

		const contentType = getContentType(mContent)
		let mediaType = contentType?.replace('Message', '') as MediaType
		const media = mContent[contentType!]

		if (!media || typeof media !== 'object' || (!('url' in media) && !('thumbnailDirectPath' in media))) {
			throw new Boom(`"${contentType}" message is not a media message`)
		}

		let download: DownloadableMessage
		if ('thumbnailDirectPath' in media && !('url' in media)) {
			download = {
				directPath: media.thumbnailDirectPath,
				mediaKey: media.mediaKey
			}
			mediaType = 'thumbnail-link'
		} else {
			download = media
		}

		const stream = await downloadContentFromMessage(download, mediaType, options)
		if (type === 'buffer') {
			const bufferArray: Buffer[] = []
			for await (const chunk of stream) {
				bufferArray.push(chunk)
			}

			return Buffer.concat(bufferArray)
		}

		return stream
	}
}

/** Checks whether the given message is a media message; if it is returns the inner content */
export const assertMediaContent = (content: proto.IMessage | null | undefined) => {
	content = extractMessageContent(content)
	const mediaContent =
		content?.documentMessage ||
		content?.imageMessage ||
		content?.videoMessage ||
		content?.audioMessage ||
		content?.stickerMessage
	if (!mediaContent) {
		throw new Boom('given message is not a media message', { statusCode: 400, data: content })
	}

	return mediaContent
}
