'use strict'
const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { createTables } = require('../lib/ships')
const root = path.resolve(__dirname, '..')
function fixture(t) {
	const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'muthr-gm-'))
	let tables = createTables({ shipsRoot: path.join(root, 'data'), dataDir })
	t.after(() => {
		tables.close()
		fs.rmSync(dataDir, { recursive: true, force: true })
	})
	return {
		get tables() {
			return tables
		},
		restart() {
			tables.close()
			tables = createTables({ shipsRoot: path.join(root, 'data'), dataDir })
			return tables
		},
	}
}

test('Montero defaults, complete rolodex PINs and command star map grants', async (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('montero')
	const ship = f.tables.readTable(code).ship
	const { accountForPin, grantsFor } = await import('../client/src/lib/access.js')
	const pins = require('../gm/montero/pins.json').pins
	assert.equal(ship.computer, 'MU/TH/UR 6500')
	assert.equal(ship.accounts.length, 5)
	const titles = ['Captain', 'Pilot', 'Technician', 'Cargo Handler', 'Corporate Liaison']
	ship.accounts.forEach((account, i) => {
		assert.equal(account.status, 'Aboard')
		assert.equal(account.job, titles[i])
		assert.equal(accountForPin(ship, pins[account.id]).id, account.id)
	})
	assert(grantsFor(ship, ship.accounts[0]).modules.includes('starmap'))
	assert(!grantsFor(ship, ship.accounts[1]).modules.includes('starmap'))
	assert(grantsFor(ship, { clearance: ['company'] }).modules.includes('starmap'))
	assert(
		!grantsFor(ship, {
			clearance: ['company'],
			restrictTo: { modules: ['mail'] },
		}).modules.includes('starmap'),
	)
})

test('table-specific roster and PIN changes persist and reach login state without affecting another table', async (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('montero')
	const other = f.tables.createTable('montero').code
	const { accountForPin } = await import('../client/src/lib/access.js')
	const original = require('../gm/montero/pins.json').pins['m-miller']
	f.tables.patch(code, {
		updateCrew: {
			id: 'm-miller',
			name: 'Captain V. Miller',
			job: 'Commander',
			status: 'Injured',
			clearance: ['company'],
			pin: '983621',
		},
	})
	const state = f.tables.readState(code)
	const changed = state.accounts.find((a) => a.id === 'm-miller')
	assert.equal(changed.name, 'Captain V. Miller')
	assert.equal(changed.status, 'Injured')
	assert.equal(changed.job, 'Commander')
	assert.deepEqual(changed.clearance, ['company'])
	const ship = f.tables.readTable(code).ship
	assert.equal(accountForPin(ship, '983621').id, 'm-miller')
	assert.equal(accountForPin(ship, original), null)
	assert.equal(accountForPin(f.tables.readTable(other).ship, original).id, 'm-miller')
	const gm = f.tables.gmDetail(code).ships[0].accounts[0]
	assert.equal(gm.hasPin, true)
	assert.equal(gm.pinHash, undefined)
	assert.equal(gm.pin, '983621')
	assert.equal(f.tables.readTable(code).ship.accounts[0].pinSecret, undefined)
	assert.throws(
		() => f.tables.patch(code, { updateCrew: { id: 'm-davis', pin: '983621' } }),
		/already assigned/,
	)
	assert.throws(() => f.tables.patch(code, { updateCrew: { id: 'm-davis', pin: '11' } }), /4 to 12/)
	f.restart()
	assert.equal(accountForPin(f.tables.readTable(code).ship, '983621').id, 'm-miller')
})

test('new crew requires valid fields and an unused portrait; personal notes, mail and transfer use edited records', async (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('chariot')
	const detail = f.tables.gmDetail(code)
	const photo = detail.portraits[0].url
	const fields = {
		name: 'New Engineer',
		job: 'Engineer',
		status: 'Aboard',
		clearance: ['crew'],
		pin: '907263',
		photo,
	}
	const updated = f.tables.patch(code, { shipId: 'montero', createCrew: fields })
	const account = updated.ships
		.find((s) => s.id === 'montero')
		.accounts.find((a) => a.name === fields.name)
	assert(account)
	assert.equal(account.photo, photo)
	assert(!updated.portraits.some((p) => p.url === photo))
	assert.throws(
		() => f.tables.patch(code, { shipId: 'montero', createCrew: { ...fields, pin: '907264' } }),
		/already assigned/,
	)
	assert.throws(
		() =>
			f.tables.patch(code, {
				shipId: 'montero',
				createCrew: { ...fields, photo: '', clearance: ['invalid'] },
			}),
		/valid clearance/,
	)
	f.tables.sendMessage(code, {
		shipId: 'montero',
		from: account.id,
		to: 'm-miller',
		subject: 'Report',
		body: 'All clear',
	})
	f.tables.saveNote(code, { shipId: 'montero', accountId: account.id, body: 'Station note' })
	f.tables.patch(code, {
		access: { cronus: true },
		shipId: 'montero',
		transfer: { accountId: account.id, fromShip: 'montero', toShip: 'cronus' },
	})
	const destination = f.tables.readTable(code, 'cronus').ship
	const { accountForPin } = await import('../client/src/lib/access.js')
	assert.equal(accountForPin(destination, fields.pin).id, account.id)
	assert(destination.notes.some((n) => n.owner === account.id && n.body === 'Station note'))
})

test('existing and new dated logs, announcements and mail are editable without replacing unrelated records', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('cronus')
	const gm = f.tables.gmDetail(code).ships[0]
	const log = gm.logs[0]
	f.tables.patch(code, { saveLog: { ...log, text: 'Corrected log', time: '2183-11-12 14:30' } })
	let ship = f.tables.readTable(code).ship
	assert.equal(ship.logs.length, gm.logs.length)
	assert.equal(ship.logs[0].text, 'Corrected log')
	assert.equal(ship.logs[0].time, '2183-11-12 14:30')
	f.tables.patch(code, { saveLog: { text: 'New log', time: '2183-11-13', clearance: ['command'] } })
	assert.equal(f.tables.readTable(code).ship.logs.length, gm.logs.length + 1)
	const announcement = gm.announcements[0]
	f.tables.patch(code, {
		saveAnnouncement: {
			...announcement,
			title: 'Public order',
			body: 'Report aboard',
			clearance: ['public'],
		},
	})
	assert.equal(f.tables.readState(code).announcements[0].title, 'Public order')
	const message = gm.mail[0]
	f.tables.patch(code, { saveMail: { ...message, body: 'Edited scenario mail' } })
	ship = f.tables.readTable(code).ship
	assert.equal(ship.mail.length, gm.mail.length)
	assert.equal(ship.mail[0].body, 'Edited scenario mail')
	f.tables.patch(code, { deleteLog: log.id })
	assert(!f.tables.readState(code).logs.some((item) => item.id === log.id))
	assert.throws(() => f.tables.patch(code, { saveLog: { id: 'missing', text: 'x' } }), /not found/)
})

test('blueprint and star map edits persist, sync to players, stay table-specific, and are removed with their ship', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('chariot')
	const other = f.tables.createTable('cronus').code
	const original = f.tables.gmDetail(code).ships.find((s) => s.id === 'cronus').blueprints
	const blueprints = structuredClone(original)
	blueprints.decks[0].name = 'Upper deck'
	blueprints.overview.company = 'images/DeckA.png'
	blueprints.rooms.bridge.name = 'Command bridge'
	const starMap = {
		position: { name: '26 Draconis', x: 30, y: 70 },
		locations: [{ name: 'LV-1113', x: 40, y: 60 }],
		notes: 'Approach',
		updatedAt: '2183-11-12',
	}
	f.tables.patch(code, { shipId: 'cronus', blueprints, starMap, access: { cronus: true } })
	assert.equal(f.tables.readState(code, '', 'cronus').blueprints.decks[0].name, 'Upper deck')
	assert.deepEqual(f.tables.readTable(code, 'cronus').ship.starMap, starMap)
	assert.notEqual(f.tables.readTable(other).ship.decks[0].name, 'Upper deck')
	f.restart()
	assert.equal(
		f.tables.gmDetail(code).ships.find((s) => s.id === 'cronus').blueprints.decks[0].name,
		'Upper deck',
	)
	assert.throws(
		() =>
			f.tables.patch(code, {
				shipId: 'cronus',
				starMap: { ...starMap, position: { name: 'x', x: 101, y: 0 } },
			}),
		/0 to 100/,
	)
	assert.throws(
		() =>
			f.tables.patch(code, {
				shipId: 'cronus',
				blueprints: { ...blueprints, overview: { public: 'javascript:alert(1)' } },
			}),
		/HTTPS/,
	)
	f.tables.patch(code, { ships: ['montero'], home: 'montero' })
	f.tables.patch(code, { ships: ['montero', 'cronus'], home: 'montero' })
	assert.equal(
		f.tables.gmDetail(code).ships.find((s) => s.id === 'cronus').blueprints.decks[0].name,
		original.decks[0].name,
	)
})

test('prepared events stay private until pushed and apply multiple changes atomically', (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('cronus')
	const initial = f.tables.readState(code)
	let gm = f.tables.patch(code, {
		saveCue: {
			name: 'Hull breach',
			changes: {
				systems: { airlock: { state: 'Locked', level: 'CRITICAL' } },
				roster: { 'a-johns': { status: 'Injured' } },
				saveAnnouncement: {
					title: 'Emergency',
					body: 'Seal the airlock',
					time: '2183-11-12 15:00',
					clearance: ['public'],
				},
				saveMail: {
					from: 'wy-corporate',
					to: 'crew',
					subject: 'Emergency protocol',
					body: 'Follow orders',
					time: '2183-11-12 15:00',
					clearance: ['crew'],
				},
				saveLog: { text: 'Hull breach detected', time: '2183-11-12 15:00', clearance: ['crew'] },
			},
		},
	})
	assert.deepEqual(f.tables.readState(code).systems, initial.systems)
	assert.equal(f.tables.readState(code).announcements.length, initial.announcements.length)
	assert.equal(f.tables.readTable(code).ship.cues, undefined)
	const cue = gm.ships[0].cues[0]
	assert.throws(
		() => f.tables.patch(code, { saveCue: { name: 'Bad', changes: { createCrew: {} } } }),
		/support/,
	)
	f.restart()
	gm = f.tables.patch(code, { runCue: cue.id })
	const state = f.tables.readState(code)
	assert.equal(state.systems.find((s) => s.id === 'airlock').state, 'Locked')
	assert.equal(state.roster['a-johns'].status, 'Injured')
	f.tables.patch(code, { updateCrew: { id: 'a-johns', pin: '983622' } })
	assert.equal(f.tables.readState(code).roster['a-johns'].status, 'Injured')
	assert.equal(state.announcements.length, initial.announcements.length + 1)
	assert.equal(state.mail.length, initial.mail.length + 1)
	assert.equal(state.logs.length, initial.logs.length + 1)
	assert(gm.ships[0].cues[0].lastPushedAt)
	const bad = f.tables
		.patch(code, {
			saveCue: {
				name: 'Invalid data',
				changes: { systems: { airlock: { state: 'Open' } }, saveLog: { text: '' } },
			},
		})
		.ships[0].cues.find((c) => c.name === 'Invalid data')
	assert.throws(() => f.tables.patch(code, { runCue: bad.id }), /text is required/)
	assert.equal(f.tables.readState(code).systems.find((s) => s.id === 'airlock').state, 'Locked')
	f.tables.patch(code, { deleteCue: cue.id })
	assert(!f.tables.gmDetail(code).ships[0].cues.some((c) => c.id === cue.id))
})

test('scenario defaults contain no Park account, credentials or records, and Cronus does not attach an auditor packet', (t) => {
	const f = fixture(t)
	for (const id of ['cronus', 'montero']) {
		const template = fs.readFileSync(path.join(root, 'data', id, 'ship.json'), 'utf8')
		const pins = fs.readFileSync(path.join(root, 'gm', id, 'pins.json'), 'utf8')
		assert(!/s-park|S\. Park|Auditor Park/.test(template))
		assert(!/s-park/.test(pins))
		const { code } = f.tables.createTable(id)
		assert(!JSON.stringify(f.tables.readTable(code)).includes('s-park'))
		if (id === 'cronus')
			assert.deepEqual(
				f.tables.gmDetail(code).ships.map((ship) => ship.id),
				['cronus'],
			)
	}
})

test('star map backgrounds persist, sync to players, can be cleared, and reject invalid image data', async (t) => {
	const f = fixture(t)
	const { code } = f.tables.createTable('montero')
	const map = f.tables.gmDetail(code).ships[0].starMap
	const raster = await require('sharp')({
		create: { width: 2, height: 2, channels: 3, background: '#000' },
	})
		.png()
		.toBuffer()
	const uploaded = (
		await f.tables.uploadImage(code, 'data:image/png;base64,' + raster.toString('base64'))
	).url
	f.tables.patch(code, {
		starMap: { ...map, background: uploaded, backgroundOpacity: 0.5, backgroundFit: 'cover' },
	})
	f.restart()
	assert.equal(f.tables.readState(code).starMap.background, uploaded)
	assert.equal(f.tables.readState(code).starMap.backgroundOpacity, 0.5)
	assert.equal(f.tables.gmDetail(code).ships[0].starMap.backgroundFit, 'cover')
	for (const background of [
		'javascript:alert(1)',
		'data:image/svg+xml;base64,PHN2Zy8+',
		'data:image/png;base64,aGVsbG8=',
	]) {
		assert.throws(
			() => f.tables.patch(code, { starMap: { ...map, background } }),
			/background|Background|Image/,
		)
	}
	assert.throws(
		() => f.tables.patch(code, { starMap: { ...map, backgroundOpacity: 2 } }),
		/opacity/,
	)
	f.tables.patch(code, { starMap: { ...map, background: 'https://example.com/map.png' } })
	assert.equal(f.tables.readTable(code).ship.starMap.background, 'https://example.com/map.png')
	f.tables.patch(code, { starMap: { ...map, background: '' } })
	assert.equal(f.tables.readState(code).starMap.background, '')
})
