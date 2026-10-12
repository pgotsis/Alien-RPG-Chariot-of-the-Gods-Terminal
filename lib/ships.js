'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { createStore, SHIP_ID, TABLE_CODE } = require('./store')

function fail(message, status) {
	const err = new Error(message)
	err.statusCode = status || 400
	throw err
}

function pinHash(salt, pin) {
	return crypto.createHash('sha256').update(String(salt) + ':' + String(pin).trim().toUpperCase()).digest('hex')
}

function stamp() {
	const date = new Date()
	const pad = function (value) { return String(value).padStart(2, '0') }
	return pad(date.getMonth() + 1) + '.' + pad(date.getDate()) + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
}

function createTables(options) {
	const shipsRoot = path.resolve(options.shipsRoot)
	const store = createStore(options.dataDir)

	function shipFile(shipId) {
		if (typeof shipId !== 'string' || !SHIP_ID.test(shipId)) fail('Invalid ship id', 400)
		const file = path.resolve(shipsRoot, shipId, 'ship.json')
		if (!file.startsWith(shipsRoot + path.sep)) fail('Invalid ship id', 400)
		return file
	}

	function readShip(shipId) {
		const file = shipFile(shipId)
		if (!fs.existsSync(file)) return null
		let ship
		try {
			ship = JSON.parse(fs.readFileSync(file, 'utf8'))
		} catch (err) {
			fail('Ship file is not valid JSON', 500)
		}
		if (!ship || ship.id !== shipId) fail('Ship file id does not match its directory', 500)
		return ship
	}

	function allShips() {
		if (!fs.existsSync(shipsRoot)) return []
		return fs.readdirSync(shipsRoot, { withFileTypes: true })
			.filter(function (entry) { return entry.isDirectory() })
			.map(function (entry) { return readShip(entry.name) })
			.filter(Boolean)
	}

	function shipCard(ship) {
		return { id: ship.id, name: ship.name, computer: ship.computer || 'MU/TH/UR' }
	}

	function listScenarios() {
		const ships = allShips()
		const playable = ships.filter(function (ship) { return !ship.packet })
		const byId = {}
		for (const ship of playable) byId[ship.id] = ship
		const starts = []
		if (byId.montero && byId.cronus) {
			starts.push({
				id: 'chariot',
				name: 'Chariot of the Gods',
				computer: 'MU/TH/UR',
				home: 'montero',
				ships: ['montero', 'cronus']
			})
		}
		for (const ship of playable) {
			starts.push({
				id: ship.id,
				name: ship.name,
				computer: ship.computer || '',
				home: ship.id,
				ships: [ship.id]
			})
		}
		return { starts: starts, ships: ships.map(shipCard) }
	}

	function requireRun(code) {
		const normalized = String(code || '').trim().toUpperCase()
		if (!TABLE_CODE.test(normalized)) fail('Invalid table code', 400)
		const row = store.run(normalized)
		if (!row) fail('Table not found', 404)
		return row
	}

	function publicAccount(account) {
		const copy = Object.assign({}, account)
		if (copy.overrideHash && copy.packetShip) copy.override = true
		delete copy.overrideHash
		delete copy.packetShip
		return copy
	}

	function present(ship, live, packet, extras) {
		const copy = structuredClone(ship)
		copy.accounts = (copy.accounts || []).map(function (account) {
			const next = publicAccount(account)
			if (packet) {
				delete next.pinHash
				delete next.pinHashes
			}
			const row = live.roster[next.id]
			if (row) {
				if (row.status != null) next.status = row.status
				if (row.lastLogin != null) next.lastLogin = row.lastLogin
				if (row.classifiedStatus != null) next.classifiedStatus = row.classifiedStatus
			}
			return next
		})
		for (const extra of extras || []) {
			if (!extra || copy.accounts.some(function (account) { return account.id === extra.id })) continue
			const next = publicAccount(extra)
			if (packet) {
				delete next.pinHash
				delete next.pinHashes
			}
			const row = live.roster[next.id]
			if (row) {
				if (row.status != null) next.status = row.status
				if (row.lastLogin != null) next.lastLogin = row.lastLogin
				if (row.classifiedStatus != null) next.classifiedStatus = row.classifiedStatus
			}
			copy.accounts.push(next)
		}
		copy.systems = live.systems
		copy.announcements = live.announcements
		copy.logs = live.logs
		copy.mail = live.mail
		copy.notes = live.notes
		return copy
	}

	function playerShip(code, shipId) {
		const ship = readShip(shipId)
		if (!ship) fail('Ship file is missing', 500)
		return present(ship, store.shipState(code, shipId), ship.packet === true, store.extraAccounts(code, shipId))
	}

	function homeOf(row) {
		return row.home_ship || row.ship_id
	}

	function resolveShip(row, requested) {
		const id = typeof requested === 'string' ? requested.trim().toLowerCase() : ''
		if (id && store.shipKind(row.code, id)) return id
		return homeOf(row)
	}

	function shipCards(code) {
		return store.shipsOf(code).map(function (link) {
			const ship = readShip(link.ship_id)
			return {
				id: link.ship_id,
				name: ship ? ship.name : link.ship_id,
				computer: ship ? (ship.computer || 'MU/TH/UR') : 'MU/TH/UR'
			}
		})
	}

	function readTable(rawCode, requestedShip) {
		const row = requireRun(rawCode)
		store.touchSeen(row.code, 'player', true)
		const shipId = resolveShip(row, requestedShip)
		return {
			code: row.code,
			revision: row.revision,
			homeShip: homeOf(row),
			ships: shipCards(row.code),
			pulses: store.pulses(row.code),
			ship: playerShip(row.code, shipId)
		}
	}

	function readState(rawCode, token, requestedShip) {
		const row = requireRun(rawCode)
		store.touchSeen(row.code, 'player', false)
		const fresh = store.run(row.code)
		const shipId = resolveShip(fresh, requestedShip)
		const live = store.shipState(fresh.code, shipId)
		const body = {
			code: fresh.code,
			revision: fresh.revision,
			homeShip: homeOf(fresh),
			ships: shipCards(fresh.code),
			pulses: store.pulses(fresh.code),
			shipId: shipId,
			roster: live.roster,
			systems: live.systems,
			announcements: live.announcements,
			logs: live.logs,
			mail: live.mail,
			notes: live.notes,
			packet: null
		}
		const accountId = store.overrideAccount(fresh.code, token)
		if (accountId) {
			const source = readShip(shipId)
			const account = source && (source.accounts || []).find(function (item) { return item.id === accountId })
			const target = account && account.packetShip
			if (target && store.shipKind(fresh.code, target)) body.packet = playerShip(fresh.code, target)
		}
		return body
	}

	function attachPackets(code, ships) {
		const presentIds = new Set(store.shipsOf(code).map(function (link) { return link.ship_id }))
		for (const ship of ships) {
			for (const account of (ship && ship.accounts) || []) {
				if (!account || !account.packetShip || !account.overrideHash) continue
				if (presentIds.has(account.packetShip)) continue
				const extra = readShip(account.packetShip)
				if (!extra) fail('Packet ship ' + account.packetShip + ' is missing', 500)
				presentIds.add(account.packetShip)
				store.attachShip(code, extra, 'packet', account.id)
			}
		}
	}

	function startShips(ids, homeId, label) {
		const unique = []
		for (const id of ids || []) {
			if (typeof id === 'string' && unique.indexOf(id) === -1) unique.push(id)
		}
		if (!unique.length) fail('A table needs a ship', 400)
		const loaded = unique.map(function (id) {
			const ship = readShip(id)
			if (!ship) fail('Ship not found', 404)
			if (ship.packet) fail(ship.name + ' is a company packet', 400)
			return ship
		})
		const home = loaded.find(function (ship) { return ship.id === homeId }) || loaded[0]
		const created = store.createRun(home, [])
		for (const ship of loaded) {
			if (ship.id === home.id) continue
			store.attachShip(created.code, ship, 'ship', null)
		}
		attachPackets(created.code, loaded)
		if (home.id !== created.shipId) store.setHome(created.code, home.id)
		return {
			code: created.code,
			shipId: home.id,
			name: label || home.name,
			computer: home.computer || '',
			ships: store.shipsOf(created.code).map(function (link) { return link.ship_id })
		}
	}

	function createTable(input) {
		const body = typeof input === 'string' ? { scenario: input } : (input || {})
		if (Array.isArray(body.ships) && body.ships.length) return startShips(body.ships, body.home, null)
		const scenarioId = body.scenario || body.shipId
		const start = listScenarios().starts.find(function (item) { return item.id === scenarioId })
		if (!start) fail('Scenario not found', 404)
		return startShips(start.ships, start.home, start.name)
	}

	function addedCounts(code) {
		const counts = { playerMail: 0, gmMail: 0, playerNotes: 0, gmNotes: 0, gmLogs: 0 }
		for (const link of store.shipsOf(code)) {
			const scenario = readShip(link.ship_id)
			const live = store.shipState(code, link.ship_id)
			const templateLogs = new Set(((scenario && scenario.logs) || []).map(function (item) { return item.id }))
			const templateNotes = new Set(((scenario && scenario.notes) || []).map(function (item) { return item.id }))
			const contacts = new Set(((scenario && scenario.contacts) || []).map(function (item) { return item.id }))
			for (const message of live.mail) {
				if (!message.live) continue
				if (contacts.has(message.from)) counts.gmMail += 1
				else counts.playerMail += 1
			}
			for (const note of live.notes) {
				if (note.private) counts.playerNotes += 1
				else if (!templateNotes.has(note.id)) counts.gmNotes += 1
			}
			for (const entry of live.logs) {
				if (!templateLogs.has(entry.id)) counts.gmLogs += 1
			}
		}
		return counts
	}

	function listTables() {
		return store.listRuns().map(function (row) {
			const cards = shipCards(row.code)
			const home = homeOf(row)
			const homeCard = cards.find(function (card) { return card.id === home })
			return {
				code: row.code,
				shipId: home,
				homeShip: home,
				name: cards.map(function (card) { return card.name }).join(' · ') || (homeCard ? homeCard.name : home),
				computer: homeCard ? homeCard.computer : '',
				ships: cards,
				createdAt: row.created_at,
				playerSeenAt: row.player_seen_at,
				gmSeenAt: row.gm_seen_at,
				comment: row.comment || '',
				revision: row.revision,
				added: addedCounts(row.code)
			}
		})
	}

	function accountOn(ship, accountId) {
		return (ship.accounts || []).find(function (account) { return account.id === accountId }) || null
	}

	function accountRecord(code, shipId, accountId) {
		const ship = readShip(shipId)
		const account = accountOn(ship, accountId)
		if (account) return account
		return store.extraAccounts(code, shipId).find(function (item) { return item.id === accountId }) || null
	}

	function shipFromBody(row, body) {
		const requested = body && typeof body.shipId === 'string' ? body.shipId : ''
		if (requested && store.shipKind(row.code, requested)) return requested
		return homeOf(row)
	}

	function sendMessage(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object') fail('JSON object required', 400)
		const shipId = shipFromBody(row, body)
		const ship = readShip(shipId)
		const account = accountRecord(row.code, shipId, body.from)
		if (!account || account.id === 'public') fail('Unknown sender', 400)
		const subject = typeof body.subject === 'string' ? body.subject.trim() : ''
		const text = typeof body.body === 'string' ? body.body.trim() : ''
		const to = typeof body.to === 'string' ? body.to.trim() : ''
		if (!to || !subject || !text) fail('To, subject, and body are required', 400)
		if (subject.length > 200 || text.length > 4000) fail('Message is too long', 400)
		const contact = (ship.contacts || []).find(function (item) { return item.id === to })
		const recipient = accountRecord(row.code, shipId, to)
		if (!contact && (!recipient || recipient.id === 'public' || recipient.id === account.id)) {
			fail('Unknown recipient', 400)
		}
		const message = {
			id: store.newId('m'),
			subject: subject,
			body: text,
			from: account.id,
			to: to,
			time: stamp(),
			live: true
		}
		store.mutate(row.code, shipId, ['mail'], function () {
			store.insertDoc(row.code, shipId, 'mail', message)
		})
		return message
	}

	function saveNote(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object') fail('JSON object required', 400)
		const shipId = shipFromBody(row, body)
		const account = accountRecord(row.code, shipId, body.accountId)
		if (!account || account.id === 'public') fail('Unknown account', 400)
		const text = typeof body.body === 'string' ? body.body : ''
		if (text.length > 4000) fail('Note is too long', 400)
		const note = {
			id: 'station-' + account.id,
			owner: account.id,
			title: 'Station notes',
			body: text,
			private: true,
			time: stamp()
		}
		store.mutate(row.code, shipId, [], function () {
			store.upsertNote(row.code, shipId, note)
		})
		return note
	}

	function unlock(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object') fail('JSON object required', 400)
		const shipId = shipFromBody(row, body)
		const ship = readShip(shipId)
		const account = accountOn(ship, body.accountId)
		if (!account || !account.overrideHash || !account.packetShip) fail('No company override on this account', 400)
		const digits = typeof body.code === 'string' ? body.code.trim() : ''
		if (!/^[0-9]{8}$/.test(digits)) fail('Override code must be 8 digits', 400)
		const hashed = pinHash(ship.salt, digits)
		const expected = Buffer.from(account.overrideHash)
		const got = Buffer.from(hashed)
		if (got.length !== expected.length || !crypto.timingSafeEqual(got, expected)) {
			fail('Override rejected', 403)
		}
		if (!store.shipKind(row.code, account.packetShip)) fail('Packet is not on this table', 404)
		const token = crypto.randomBytes(24).toString('hex')
		store.saveOverride(row.code, account.id, token)
		return { token: token, packet: playerShip(row.code, account.packetShip) }
	}

	function applyTransfer(code, spec) {
		if (!spec || typeof spec !== 'object') fail('Transfer is required', 400)
		const fromShip = spec.fromShip
		const toShip = spec.toShip
		const accountId = spec.accountId
		if (!store.shipKind(code, fromShip) || !store.shipKind(code, toShip)) fail('Both ships must be on this table', 400)
		if (fromShip === toShip) fail('Pick a different computer', 400)
		const sourceShip = readShip(fromShip)
		const account = accountRecord(code, fromShip, accountId)
		if (!account || account.id === 'public') fail('Unknown person', 400)
		const boarded = Object.assign({}, account, {
			listed: true,
			transferred: true,
			status: 'Aboard',
			pinSalt: account.pinSalt || (sourceShip && sourceShip.salt) || ''
		})
		delete boarded.override
		delete boarded.overrideHash
		delete boarded.packetShip
		store.saveExtraAccount(code, toShip, boarded)
		store.patchRoster(code, toShip, { [account.id]: { status: 'Aboard' } })
		const source = store.shipState(code, fromShip)
		const destination = store.shipState(code, toShip)
		const have = new Set(destination.mail.map(function (message) { return message.id }))
		for (const message of source.mail) {
			if (!message.live) continue
			if (message.from !== account.id && message.to !== account.id) continue
			if (have.has(message.id)) continue
			store.insertDoc(code, toShip, 'mail', message)
		}
		const personal = source.notes.filter(function (note) { return note.private && note.owner === account.id })
		for (const note of personal) store.upsertNote(code, toShip, note)
		store.replaceDocs(code, fromShip, 'mail', source.mail.filter(function (message) {
			if (!message.live) return true
			return message.from !== account.id && message.to !== account.id
		}))
		store.replaceDocs(code, fromShip, 'notes', source.notes.filter(function (note) {
			return !(note.private && note.owner === account.id)
		}))
	}

	function transfer(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object') fail('JSON object required', 400)
		store.mutate(row.code, body.toShip, ['mail', 'notes'], function () {
			applyTransfer(row.code, body)
		})
		return { ok: true }
	}

	function gmDetail(rawCode) {
		const row = requireRun(rawCode)
		store.touchSeen(row.code, 'gm', true)
		const fresh = store.run(row.code)
		const home = homeOf(fresh)
		const ships = store.shipsOf(fresh.code).map(function (link) {
			const scenario = readShip(link.ship_id)
			const live = store.shipState(fresh.code, link.ship_id)
			const extras = store.extraAccounts(fresh.code, link.ship_id)
			const accounts = ((scenario && scenario.accounts) || []).map(function (account) {
				const status = live.roster[account.id] || {}
				return {
					id: account.id,
					name: account.name,
					job: account.job || '',
					status: status.status == null ? account.status || '' : status.status,
					classifiedStatus: status.classifiedStatus == null ? account.classifiedStatus || '' : status.classifiedStatus,
					transferred: false
				}
			})
			for (const extra of extras) {
				if (accounts.some(function (account) { return account.id === extra.id })) continue
				const status = live.roster[extra.id] || {}
				accounts.push({
					id: extra.id,
					name: extra.name,
					job: extra.job || '',
					status: status.status == null ? extra.status || 'Aboard' : status.status,
					classifiedStatus: status.classifiedStatus || '',
					transferred: true
				})
			}
			return {
				id: link.ship_id,
				name: scenario ? scenario.name : link.ship_id,
				computer: scenario ? (scenario.computer || 'MU/TH/UR') : 'MU/TH/UR',
				kind: link.kind,
				accountId: link.account_id,
				contacts: (scenario && scenario.contacts) || [],
				accounts: accounts,
				systems: live.systems.map(function (system) {
					return { id: system.id, name: system.name, state: system.state, options: system.options || '' }
				})
			}
		})
		const messages = []
		for (const ship of ships) {
			for (const message of store.shipState(fresh.code, ship.id).mail) {
				if (!message.live) continue
				messages.push(Object.assign({ shipId: ship.id, shipName: ship.name }, message))
			}
		}
		const homeCard = ships.find(function (ship) { return ship.id === home }) || ships[0]
		return {
			code: fresh.code,
			shipId: home,
			homeShip: home,
			name: ships.map(function (ship) { return ship.name }).join(' · '),
			computer: homeCard ? homeCard.computer : '',
			comment: fresh.comment || '',
			createdAt: fresh.created_at,
			playerSeenAt: fresh.player_seen_at,
			gmSeenAt: fresh.gm_seen_at,
			revision: fresh.revision,
			added: addedCounts(fresh.code),
			ships: ships,
			catalog: listScenarios().ships,
			messages: messages
		}
	}

	function applyShips(code, ids, homeId) {
		const unique = []
		for (const id of ids) {
			if (typeof id !== 'string' || !SHIP_ID.test(id) || unique.indexOf(id) !== -1) continue
			unique.push(id)
		}
		if (!unique.length) fail('A table needs a ship', 400)
		const current = store.shipsOf(code).map(function (link) { return link.ship_id })
		for (const id of current) {
			if (unique.indexOf(id) === -1) store.dropShip(code, id)
		}
		const loaded = []
		for (const id of unique) {
			const ship = readShip(id)
			if (!ship) fail('Ship not found', 404)
			loaded.push(ship)
			if (current.indexOf(id) === -1) store.attachShip(code, ship, ship.packet ? 'packet' : 'ship', null)
		}
		const home = unique.indexOf(homeId) !== -1 ? homeId : unique[0]
		store.setHome(code, home)
		attachPackets(code, loaded.filter(function (ship) { return !ship.packet }))
	}

	function patch(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object' || Array.isArray(body)) fail('JSON object required', 400)
		const shipId = typeof body.shipId === 'string' && body.shipId ? body.shipId : homeOf(row)
		const pulseShip = body.transfer && body.transfer.toShip && !body.systems && !body.roster && !body.appendLog && !body.appendMail && !body.deleteSystem
			? body.transfer.toShip
			: shipId
		let dirty = false
		const modules = []
		function mark(module) { modules.push(module) }
		store.mutate(row.code, pulseShip, modules, function () {
			if (typeof body.comment === 'string') {
				store.setComment(row.code, body.comment)
				dirty = true
			}
			if (Array.isArray(body.ships)) {
				applyShips(row.code, body.ships, body.home)
				dirty = true
			} else if (typeof body.home === 'string') {
				if (!store.shipKind(row.code, body.home)) fail('Home ship is not on this table', 400)
				store.setHome(row.code, body.home)
				dirty = true
			}
			if (body.transfer) {
				applyTransfer(row.code, body.transfer)
				dirty = true
				mark('mail')
				mark('notes')
			}
			const content = body.roster || body.systems || body.announcements || body.logs || body.mail || body.notes || body.appendLog || body.appendMail || body.deleteSystem
			if (content) {
				if (!store.shipKind(row.code, shipId)) fail('Ship is not on this table', 400)
			}
			if (body.roster) {
				store.patchRoster(row.code, shipId, body.roster)
				mark('personnel')
			}
			if (body.systems) {
				store.patchSystems(row.code, shipId, body.systems)
				mark('status')
			}
			if (typeof body.deleteSystem === 'string') {
				store.deleteSystem(row.code, shipId, body.deleteSystem)
				mark('status')
			}
			if (body.announcements) {
				store.replaceDocs(row.code, shipId, 'announcements', body.announcements)
				mark('announcements')
			}
			if (body.logs) {
				store.replaceDocs(row.code, shipId, 'logs', body.logs)
				mark('logs')
			}
			if (body.mail) {
				store.replaceDocs(row.code, shipId, 'mail', body.mail)
				mark('mail')
			}
			if (body.notes) {
				store.replaceDocs(row.code, shipId, 'notes', body.notes)
				mark('notes')
			}
			if (body.appendLog) {
				const entry = body.appendLog
				if (!entry || typeof entry.text !== 'string' || !entry.text.trim()) fail('Log text is required', 400)
				const clearance = Array.isArray(entry.clearance) && entry.clearance.length ? entry.clearance : ['crew']
				store.insertDoc(row.code, shipId, 'logs', {
					id: store.newId('l'),
					time: stamp(),
					clearance: clearance,
					text: entry.text.trim().slice(0, 4000)
				})
				mark('logs')
			}
			if (body.appendMail) {
				const entry = body.appendMail
				if (!entry || typeof entry !== 'object') fail('Mail is required', 400)
				const subject = typeof entry.subject === 'string' ? entry.subject.trim() : ''
				const text = typeof entry.body === 'string' ? entry.body.trim() : ''
				const to = typeof entry.to === 'string' ? entry.to.trim() : ''
				const from = typeof entry.from === 'string' ? entry.from.trim() : ''
				if (!subject || !text || !to || !from) fail('Mail needs from, to, subject, and body', 400)
				store.insertDoc(row.code, shipId, 'mail', {
					id: store.newId('m'),
					subject: subject.slice(0, 200),
					body: text.slice(0, 4000),
					from: from,
					to: to,
					time: stamp(),
					live: true
				})
				mark('mail')
			}
			if (!dirty && !modules.length) fail('Nothing to update', 400)
		})
		return gmDetail(row.code)
	}

	return {
		listScenarios: listScenarios,
		createTable: createTable,
		listTables: listTables,
		readTable: readTable,
		readState: readState,
		sendMessage: sendMessage,
		saveNote: saveNote,
		unlock: unlock,
		transfer: transfer,
		gmDetail: gmDetail,
		patch: patch,
		close: function () { store.close() }
	}
}

module.exports = { createTables: createTables }
