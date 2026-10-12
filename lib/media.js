'use strict'
const sharp = require('sharp')
function fail(message) {
	const error = new Error(message)
	error.statusCode = 400
	throw error
}
async function sanitizeImage(value) {
	if (typeof value !== 'string' || value.length > 2800000) fail('Image must be at most 2 MB')
	const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value)
	if (!match) fail('Only PNG, JPEG and WebP images are accepted')
	const bytes = Buffer.from(match[2], 'base64')
	if (bytes.length > 2 * 1024 * 1024 || bytes.toString('base64') !== match[2])
		fail('Invalid or oversized image')
	try {
		const image = sharp(bytes, { limitInputPixels: 16000000, failOn: 'warning', animated: false })
		const meta = await image.metadata()
		if (
			!['png', 'jpeg', 'webp'].includes(meta.format) ||
			meta.format !== match[1] ||
			(meta.pages || 1) !== 1 ||
			meta.width > 8192 ||
			meta.height > 8192
		)
			fail('Invalid image format or dimensions')
		const output = await image.rotate().webp({ quality: 90 }).toBuffer()
		if (output.length > 2 * 1024 * 1024) fail('Decoded image is too large')
		return output
	} catch (error) {
		if (error.statusCode) throw error
		fail('Image could not be safely decoded')
	}
}
module.exports = { sanitizeImage }
