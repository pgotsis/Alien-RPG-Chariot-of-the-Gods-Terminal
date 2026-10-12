'use strict'
const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
function pinVault(dataDir) {
	function key() {
		fs.mkdirSync(dataDir, { recursive: true })
		const file = path.join(dataDir, 'gm-pin.key')
		if (!fs.existsSync(file)) {
			try {
				fs.writeFileSync(file, crypto.randomBytes(32), { flag: 'wx', mode: 0o600 })
			} catch (error) {
				if (error.code !== 'EEXIST') throw error
			}
		}
		const value = fs.readFileSync(file)
		if (value.length !== 32) throw new Error('Invalid GM PIN encryption key')
		return value
	}
	return {
		encrypt(pin) {
			const iv = crypto.randomBytes(12)
			const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv)
			const bytes = Buffer.concat([cipher.update(pin, 'utf8'), cipher.final()])
			return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString('base64')
		},
		decrypt(value) {
			const bytes = Buffer.from(value, 'base64')
			const decipher = crypto.createDecipheriv('aes-256-gcm', key(), bytes.subarray(0, 12))
			decipher.setAuthTag(bytes.subarray(12, 28))
			return Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8')
		},
	}
}
module.exports = { pinVault }
