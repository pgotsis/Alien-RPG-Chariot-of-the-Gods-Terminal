'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')
const net = require('node:net')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const sharp = require('sharp')
test(
	'HTTP registration and upload require GM credentials; sanitized images use fixed security headers',
	{ timeout: 20000 },
	async (t) => {
		const probe = net.createServer()
		probe.listen(0, '127.0.0.1')
		await once(probe, 'listening')
		const port = probe.address().port
		await new Promise((r) => probe.close(r))
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gm-auth-'))
		const token = require('node:crypto').randomBytes(24).toString('hex')
		const child = spawn(process.execPath, ['server.js'], {
			cwd: path.resolve(__dirname, '..'),
			env: {
				...process.env,
				PORT: String(port),
				DATA_DIR: dir,
				GM_TOKEN: token,
				BASE_PATH: '/test/',
			},
			stdio: 'ignore',
		})
		t.after(async () => {
			if (child.exitCode === null) {
				child.kill('SIGTERM')
				await once(child, 'exit')
			}
			fs.rmSync(dir, { recursive: true, force: true })
		})
		const base = `http://127.0.0.1:${port}/test/`
		let ready = false
		for (let i = 0; i < 100; i++) {
			try {
				if ((await fetch(base + 'health')).ok) {
					ready = true
					break
				}
			} catch {}
			await new Promise((r) => setTimeout(r, 30))
		}
		assert(ready)
		const request = (url, body, auth = true) =>
			fetch(base + url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					...(auth ? { Authorization: 'Bearer ' + token } : {}),
				},
				body: JSON.stringify(body),
			})
		const created = await (await request('api/gm/tables', { scenario: 'chariot' })).json()
		const code = created.code
		const registration = { fromShip: 'montero', toShip: 'cronus', accountId: 'm-miller' }
		assert.equal(
			(await request('api/tables/' + code + '/transfer', registration, false)).status,
			401,
		)
		assert.equal((await request('api/tables/' + code + '/transfer', registration)).status, 200)
		const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#fff' } })
			.png()
			.toBuffer()
		const image = 'data:image/png;base64,' + png.toString('base64')
		assert.equal((await request('api/gm/tables/' + code + '/images', { image }, false)).status, 401)
		const uploaded = await request('api/gm/tables/' + code + '/images', { image })
		assert.equal(uploaded.status, 200)
		const file = await fetch(base + (await uploaded.json()).url)
		assert.equal(file.status, 200)
		assert.equal(file.headers.get('content-type'), 'image/webp')
		assert.equal(file.headers.get('x-content-type-options'), 'nosniff')
		assert(file.headers.get('content-security-policy').includes('sandbox'))
		const decoded = await sharp(Buffer.from(await file.arrayBuffer())).metadata()
		assert.equal(decoded.format, 'webp')
		assert.equal(
			(
				await request('api/gm/tables/' + code + '/images', {
					image: 'data:image/png;base64,PHNjcmlwdD4=',
				})
			).status,
			400,
		)
	},
)
