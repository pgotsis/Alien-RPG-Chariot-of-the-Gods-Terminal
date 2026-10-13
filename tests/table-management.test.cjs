'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const sharp = require('sharp')
const { createTables } = require('../lib/ships')
const { sanitizeImage } = require('../lib/media')
function fixture(t) {
	const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-management-'))
	let tables = createTables({ shipsRoot: path.resolve(__dirname, '../data'), dataDir })
	t.after(() => {
		tables.close()
		fs.rmSync(dataDir, { recursive: true, force: true })
	})
	return {
		dataDir,
		get tables() {
			return tables
		},
		restart() {
			tables.close()
			tables = createTables({ shipsRoot: path.resolve(__dirname, '../data'), dataDir })
		},
	}
}
test('table clock uses current time by default, persists a base date and all jumps, and never changes record dates', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('chariot')
	assert(Math.abs(Date.parse(f.tables.readTable(code).ship.date) - Date.now()) < 2000)
	const before = f.tables.readTable(code).ship
	f.tables.patch(code, { baseDate: '2183-11-12T14:30:00Z' })
	let expected = Date.parse('2183-11-12T14:30:00Z')
	for (const minutes of [5, 30, 60, 120, 180, 300]) {
		f.tables.patch(code, { advanceMinutes: minutes })
		expected += minutes * 60000
		assert(Math.abs(Date.parse(f.tables.readState(code).date) - expected) < 5000)
	}
	f.restart()
	assert(Math.abs(Date.parse(f.tables.gmDetail(code).currentDate) - expected) < 5000)
	const after = f.tables.readTable(code).ship
	assert.deepEqual(after.mail, before.mail)
	assert.deepEqual(after.logs, before.logs)
	assert.deepEqual(after.announcements, before.announcements)
	assert.throws(
		() => f.tables.patch(code, { baseDate: '2183-02-30T00:00:00Z' }),
		/valid table date/,
	)
	assert.throws(() => f.tables.patch(code, { advanceMinutes: 7 }), /clock advance/)
})
test('GM can read defaults and encrypted override PINs; player responses never expose recoverable credentials', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('montero')
	const accounts = f.tables.gmDetail(code).ships[0].accounts
	assert.equal(accounts[0].pin, require('../gm/montero/pins.json').pins['m-miller'])
	assert.deepEqual(accounts.find((a) => a.id === 'j-wilson').clearance, ['company'])
	f.tables.patch(code, { updateCrew: { id: 'm-miller', pin: '940321' } })
	f.restart()
	assert.equal(f.tables.gmDetail(code).ships[0].accounts[0].pin, '940321')
	const publicAccount = f.tables.readState(code).accounts.find((a) => a.id === 'm-miller')
	assert.equal(publicAccount.pin, undefined)
	assert.equal(publicAccount.pinSecret, undefined)
	assert.equal(fs.statSync(path.join(f.dataDir, 'gm-pin.key')).mode & 0o777, 0o600)
	assert(!fs.readFileSync(path.join(f.dataDir, 'app.sqlite')).includes(Buffer.from('940321')))
})
test('facilities can be created, renamed, set home, opened, developed and restored per table', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('montero')
	const other = f.tables.createTable('montero').code
	let detail = f.tables.patch(code, {
		createFacility: { type: 'Space Station', name: 'Gateway', aiName: 'APOLLO', aiVersion: '9000' },
	})
	const facility = detail.ships.find((s) => s.facility.type === 'Space Station')
	assert(facility)
	assert.equal(facility.playerAccess, false)
	f.tables.patch(code, {
		home: facility.id,
		access: { [facility.id]: true },
		shipId: facility.id,
		createCrew: {
			name: 'Station officer',
			job: 'Officer',
			status: 'Aboard',
			clearance: ['command'],
			pin: '940322',
			photo: '',
		},
	})
	f.tables.patch(code, {
		shipId: facility.id,
		facility: { type: 'Base', name: 'Gateway base', aiName: 'MU/TH/UR', aiVersion: '6500' },
	})
	f.restart()
	const ship = f.tables.readTable(code).ship
	assert.equal(ship.name, 'Gateway base')
	assert.equal(ship.computer, 'MU/TH/UR 6500')
	assert.equal(ship.accounts[0].name, 'Station officer')
	f.tables.sendMessage(code, {
		from: ship.accounts[0].id,
		to: 'wy-corporate',
		subject: 'Report',
		body: 'Ready',
	})
	assert.equal(f.tables.readState(code).mail.length, 1)
	assert.equal(f.tables.readTable(other).ship.name, 'USCSS Montero')
	assert(
		f.tables
			.listTables()
			.find((t) => t.code === code)
			.name.includes('Gateway base'),
	)
	assert.throws(
		() =>
			f.tables.patch(code, {
				createFacility: { type: 'Unknown', name: 'x', aiName: 'x', aiVersion: '' },
			}),
		/facility type/,
	)
})
test('raster uploads are decoded, re-encoded, stripped, table-scoped and accepted as deck plans', async (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('cronus')
	const other = f.tables.createTable('cronus').code
	const png = await sharp({ create: { width: 32, height: 16, channels: 4, background: '#123456' } })
		.png()
		.withMetadata()
		.toBuffer()
	const result = await f.tables.uploadImage(code, 'data:image/png;base64,' + png.toString('base64'))
	const id = result.url.split('/').at(-1)
	const bytes = f.tables.readImage(code, id)
	const meta = await sharp(bytes).metadata()
	assert.equal(meta.format, 'webp')
	assert.equal(meta.width, 32)
	assert.equal(meta.exif, undefined)
	assert.equal(meta.icc, undefined)
	const blueprint = f.tables.gmDetail(code).ships[0].blueprints
	blueprint.decks[0].schematics.public = result.url
	f.tables.patch(code, { blueprints: blueprint })
	f.restart()
	assert.equal(f.tables.readTable(code).ship.decks[0].schematics.public, result.url)
	assert.throws(() => f.tables.readImage(other, id), /not found/)
	assert.throws(() => f.tables.readImage(code, '../gm-pin.key'), /not found/)
	assert.throws(() => f.tables.patch(other, { blueprints: blueprint }), /blueprint image/)
	await assert.rejects(() => sanitizeImage('data:image/svg+xml;base64,PHN2Zy8+'), /Only PNG/)
	await assert.rejects(
		() =>
			sanitizeImage(
				'data:image/png;base64,' + Buffer.from('<script>evil</script>').toString('base64'),
			),
		/safely decoded/,
	)
	await assert.rejects(
		() =>
			sanitizeImage(
				'data:image/png;base64,' + Buffer.alloc(2 * 1024 * 1024 + 1).toString('base64'),
			),
		/oversized|2 MB/,
	)
	const bomb = await sharp({
		create: { width: 4096, height: 4097, channels: 3, background: '#000' },
	})
		.png()
		.toBuffer()
	await assert.rejects(
		() => sanitizeImage('data:image/png;base64,' + bomb.toString('base64')),
		/safely decoded/,
	)
})

test('GM registration shares one canonical mailbox and notebook across facilities without moving or duplicating records', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('chariot')
	const other = f.tables.createTable('montero').code
	const id = 'm-miller'
	f.tables.sendMessage(code, {
		shipId: 'montero',
		from: id,
		to: 'm-davis',
		subject: 'Personal',
		body: 'Original',
	})
	f.tables.saveNote(code, { shipId: 'montero', accountId: id, body: 'Shared notebook' })
	f.tables.patch(code, {
		shipId: 'montero',
		saveMail: {
			from: 'wy-corporate',
			to: 'crew',
			subject: 'Local broadcast',
			body: 'Only here',
			clearance: ['crew'],
			time: '',
		},
	})
	f.tables.patch(code, {
		shipId: 'montero',
		transfer: { accountId: id, fromShip: 'montero', toShip: 'cronus' },
	})
	f.tables.patch(code, { access: { cronus: true } })
	const source = f.tables.readTable(code, 'montero').ship
	const dest = f.tables.readTable(code, 'cronus').ship
	assert(source.accounts.some((a) => a.id === id))
	assert(dest.accounts.some((a) => a.id === id))
	const message = source.mail.find((m) => m.subject === 'Personal')
	assert(dest.mail.some((m) => m.id === message.id))
	assert(dest.notes.some((n) => n.owner === id && n.body === 'Shared notebook'))
	assert(!dest.mail.some((m) => m.subject === 'Local broadcast'))
	assert.equal(
		f.tables
			.gmDetail(code)
			.ships.find((s) => s.id === 'cronus')
			.accounts.find((a) => a.id === id).pin,
		require('../gm/montero/pins.json').pins[id],
	)
	f.tables.patch(code, { shipId: 'cronus', saveMail: { ...message, body: 'Edited elsewhere' } })
	assert.equal(
		f.tables.readState(code, '', 'montero').mail.find((m) => m.id === message.id).body,
		'Edited elsewhere',
	)
	f.tables.saveNote(code, { shipId: 'cronus', accountId: id, body: 'Updated notebook' })
	assert.equal(
		f.tables.readState(code, '', 'montero').notes.find((n) => n.owner === id).body,
		'Updated notebook',
	)
	assert.equal(f.tables.gmDetail(code).added.playerMail, 1)
	assert(!f.tables.readTable(other).ship.mail.some((m) => m.id === message.id))
	f.restart()
	assert.equal(
		f.tables.readState(code, '', 'cronus').notes.find((n) => n.owner === id).body,
		'Updated notebook',
	)
	const { DatabaseSync } = require('node:sqlite')
	const db = new DatabaseSync(path.join(f.dataDir, 'app.sqlite'))
	assert.equal(
		db
			.prepare("SELECT COUNT(*) AS n FROM personal_documents WHERE code=? AND kind='mail' AND id=?")
			.get(code, message.id).n,
		1,
	)
	assert.equal(
		db.prepare('SELECT COUNT(*) AS n FROM mail WHERE code=? AND id=?').get(code, message.id).n,
		0,
	)
	db.close()
})

test('8-digit company overrides expose another AI without registration or private personal records and revoke stale tokens', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('chariot')
	const gm = f.tables.gmDetail(code)
	const wilson = gm.ships.find((s) => s.id === 'montero').accounts.find((a) => a.id === 'j-wilson')
	assert.match(wilson.overrideCode, /^[0-9]{8}$/)
	assert.equal(wilson.overrideTarget, 'cronus')
	const clayton = gm.ships.find((s) => s.id === 'cronus').accounts.find((a) => a.id === 'l-clayton')
	assert.match(clayton.overrideCode, /^[0-9]{8}$/)
	f.tables.patch(code, {
		shipId: 'cronus',
		saveAnnouncement: {
			title: 'Corporate notice',
			body: 'Notice',
			clearance: ['public'],
			time: '',
		},
		saveMail: {
			from: 'wy-corporate',
			to: 'public',
			subject: 'Public broadcast',
			body: 'Public',
			time: '',
			clearance: ['public'],
		},
	})
	f.tables.saveNote(code, { shipId: 'montero', accountId: 'j-wilson', body: 'Private notebook' })
	const response = f.tables.unlock(code, {
		shipId: 'montero',
		accountId: 'j-wilson',
		code: wilson.overrideCode,
	})
	const packet = response.packet
	assert(packet.companyRemote)
	assert.equal(packet.id, 'cronus')
	assert(
		!f.tables
			.gmDetail(code)
			.ships.find((s) => s.id === 'cronus')
			.accounts.some((a) => a.id === 'j-wilson'),
	)
	assert(packet.mail.length === 1)
	assert.equal(packet.mail[0].subject, 'Public broadcast')
	assert.equal(packet.notes.length, 0)
	assert(packet.files.every((file) => file.clearance.includes('public')))
	assert(packet.accounts.every((a) => !a.pinHash && !a.pinSecret && !a.overrideCode))
	assert.equal(f.tables.readState(code, response.token, 'montero').packet.id, 'cronus')
	assert.throws(
		() =>
			f.tables.unlock(code, { shipId: 'montero', accountId: 'm-davis', code: wilson.overrideCode }),
		/No company override/,
	)
	f.tables.patch(code, {
		shipId: 'montero',
		updateCrew: { id: 'j-wilson', overrideCode: '87654321', overrideTarget: 'cronus' },
	})
	assert.equal(f.tables.readState(code, response.token, 'montero').packet, null)
	assert.throws(
		() =>
			f.tables.unlock(code, {
				shipId: 'montero',
				accountId: 'j-wilson',
				code: wilson.overrideCode,
			}),
		/rejected/,
	)
	const fresh = f.tables.unlock(code, {
		shipId: 'montero',
		accountId: 'j-wilson',
		code: '87654321',
	})
	f.tables.patch(code, { shipId: 'montero', updateCrew: { id: 'j-wilson', clearance: ['crew'] } })
	assert.equal(f.tables.readState(code, fresh.token, 'montero').packet, null)
})

test('legacy facility-local personal records migrate without losing differing historical copies', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('chariot')
	f.tables.patch(code, {
		transfer: { accountId: 'm-miller', fromShip: 'montero', toShip: 'cronus' },
	})
	const { DatabaseSync } = require('node:sqlite')
	const db = new DatabaseSync(path.join(f.dataDir, 'app.sqlite'))
	const insert = db.prepare(
		'INSERT INTO notes (code, ship_id, id, document, position) VALUES (?, ?, ?, ?, ?)',
	)
	insert.run(
		code,
		'montero',
		'legacy-note',
		JSON.stringify({
			id: 'legacy-note',
			owner: 'm-miller',
			private: true,
			title: 'Legacy',
			body: 'Original copy',
		}),
		0,
	)
	insert.run(
		code,
		'cronus',
		'legacy-note',
		JSON.stringify({
			id: 'legacy-note',
			owner: 'm-miller',
			private: true,
			title: 'Legacy',
			body: 'Later copy',
		}),
		0,
	)
	db.close()
	const notes = f.tables.readState(code).notes.filter((note) => note.title === 'Legacy')
	assert.deepEqual(
		new Set(notes.map((note) => note.body)),
		new Set(['Original copy', 'Later copy']),
	)
	f.restart()
	assert.equal(f.tables.readState(code).notes.filter((note) => note.title === 'Legacy').length, 2)
})

test('repository star maps and background framing persist with validated grid and crop settings', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('montero')
	const detail = f.tables.gmDetail(code)
	assert(detail.starMapImages.includes('images/star_maps/full_map.jpg'))
	assert(detail.starMapImages.includes('images/star_maps/montero.jpg'))
	const map = {
		...detail.ships[0].starMap,
		background: 'images/star_maps/full_map.jpg',
		backgroundView: { zoom: 3, x: -70, y: -20 },
		showGrid: false,
	}
	f.tables.patch(code, { starMap: map })
	f.restart()
	assert.deepEqual(f.tables.readState(code).starMap, map)
	for (const backgroundView of [
		{ zoom: 0, x: 0, y: 0 },
		{ zoom: 9, x: 0, y: 0 },
		{ zoom: 2, x: 900, y: 0 },
		{ zoom: 2, x: 0, y: '0' },
	])
		assert.throws(
			() => f.tables.patch(code, { starMap: { ...map, backgroundView } }),
			/pan or zoom/,
		)
	assert.throws(
		() => f.tables.patch(code, { starMap: { ...map, showGrid: 'false' } }),
		/grid visibility/,
	)
	assert.throws(
		() =>
			f.tables.patch(code, {
				starMap: { ...map, background: 'images/star_maps/../../secret.png' },
			}),
		/HTTPS/,
	)
})
