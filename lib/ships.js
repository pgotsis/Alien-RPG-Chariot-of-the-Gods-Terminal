'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const { pinVault } = require('./pins')
const { sanitizeImage } = require('./media')
const { createStore, SHIP_ID, TABLE_CODE, statusOptions } = require('./store')

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
	const vault = pinVault(path.resolve(options.dataDir))

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

	function tableShip(code, id) {
		const template = readShip(id)
		const config = store.shipConfig(code, id)
		if (!template && !config.facility) fail('Facility not found', 404)
		const ship = template || Object.assign({}, readShip('montero'), { id, salt: code + ':' + id, accounts: [], systems: [], logs: [], announcements: [], mail: [], notes: [], decks: [], rooms: {}, overview: {} })
		const match = /^(.*?)(?: (\d+))?$/.exec(ship.computer || 'MU/TH/UR')
		ship.facility = Object.assign({ type: 'Ship', name: ship.name, aiName: match[1], aiVersion: match[2] || '' }, config.facility)
		ship.name = ship.facility.name
		ship.computer = [ship.facility.aiName, ship.facility.aiVersion].filter(Boolean).join(' ')
		return ship
	}
	function clock(code) {
		const settings = store.tableSettings(code)
		return new Date(settings.baseDate ? Date.parse(settings.baseDate) + Date.now() - settings.anchor : Date.now()).toISOString()
	}
	function gmPin(code, shipId, id, cachedAccount) {
		const account = cachedAccount || accountRecord(code, shipId, id)
		if (!account) return ''
		if (account.pinSecret) return vault.decrypt(account.pinSecret)
		const file = path.join(shipsRoot, '..', 'gm', shipId, 'pins.json')
		if (!fs.existsSync(file)) return ''
		const candidate = JSON.parse(fs.readFileSync(file, 'utf8')).pins[id]
		for (const pin of (Array.isArray(candidate) ? candidate : [candidate])) {
			if (typeof pin === 'string' && (account.pinHash === pinHash(account.pinSalt || tableShip(code, shipId).salt, pin) || (account.pinHashes || []).includes(pinHash(account.pinSalt || tableShip(code, shipId).salt, pin)))) return pin
		}
		return ''
	}
	function validateFacility(fields) {
		if (!fields || !['Ship', 'Base', 'Space Station', 'Offices'].includes(fields.type)) fail('Choose a facility type')
		for (const key of ['name', 'aiName', 'aiVersion']) if (typeof fields[key] !== 'string' || fields[key].length > 200 || (key !== 'aiVersion' && !fields[key].trim())) fail('Invalid facility ' + key)
		return { name: fields.name.trim(), type: fields.type, aiName: fields.aiName.trim(), aiVersion: fields.aiVersion.trim() }
	}
	let activeUploads = 0
	const uploadLimits = new Map()
	async function uploadImage(rawCode, image) {
		const row = requireRun(rawCode)
		const minute = Math.floor(Date.now() / 60000)
		const limit = uploadLimits.get(row.code)
		if (activeUploads >= 2 || (limit && limit.minute === minute && limit.count >= 10)) fail('Upload limit reached; try again shortly', 429)
		uploadLimits.set(row.code, { minute, count: limit && limit.minute === minute ? limit.count + 1 : 1 })
		const dir = path.join(path.resolve(options.dataDir), 'uploads', row.code)
		fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
		if (fs.readdirSync(dir).length >= 200) fail('This table has reached its 200-image limit')
		activeUploads++
		try {
			const bytes = await sanitizeImage(image)
			const id = crypto.randomBytes(24).toString('hex')
			fs.writeFileSync(path.join(dir, id + '.webp'), bytes, { flag: 'wx', mode: 0o600 })
			return { url: 'api/tables/' + row.code + '/images/' + id }
		} finally { activeUploads-- }
	}

	function validUpload(code, url) {
		const match = new RegExp('^api/tables/' + code + '/images/([a-f0-9]{48})$').exec(url)
		return Boolean(match && fs.existsSync(path.join(path.resolve(options.dataDir), 'uploads', code, match[1] + '.webp')))
	}
	function readImage(rawCode, id) {
		const row = requireRun(rawCode)
		if (typeof id !== 'string' || !/^[a-f0-9]{48}$/.test(id)) fail('Image not found', 404)
		const file = path.join(path.resolve(options.dataDir), 'uploads', row.code, id + '.webp')
		if (!fs.existsSync(file)) fail('Image not found', 404)
		return fs.readFileSync(file)
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

	function ensureOverrides(code) {
		let changed = false
		const links = store.shipsOf(code)
		for (const link of links) {
			const facility = tableShip(code, link.ship_id)
			for (const account of mergedAccounts(facility, store.extraAccounts(code, link.ship_id))) {
				if (!(account.clearance || []).includes('company')) continue
				const others = links.filter(item => item.ship_id !== link.ship_id)
				const target = others.some(item => item.ship_id === account.packetShip) ? account.packetShip : (others[0]?.ship_id || '')
				if (account.overrideHash && target === (account.packetShip || '')) continue
				const next = Object.assign({}, account, { packetShip: target })
				if (!next.overrideHash) {
					const digits = String(crypto.randomInt(0, 100000000)).padStart(8, '0')
					next.overrideHash = pinHash(facility.salt, digits)
					next.overrideSecret = vault.encrypt(digits)
				}
				store.saveExtraAccount(code, link.ship_id, next)
				changed = true
			}
		}
		if (changed) store.bump(code, null, ['personnel'])
	}
	function companyView(code, shipId) {
		const packet = playerShip(code, shipId)
		const isPublic = item => !item.private && Array.isArray(item.clearance) && item.clearance.includes('public')
		packet.mail = packet.mail.filter(item => item.to === 'public' || isPublic(item))
		packet.notes = packet.notes.filter(isPublic)
		packet.files = (packet.files || []).filter(item => isPublic(item) && !item.codeHash)
		packet.accounts = packet.accounts.map(({ id, name, job, status }) => ({ id, name, job, status }))
		packet.companyRemote = true
		return packet
	}

	function publicAccount(account) {
		const copy = Object.assign({}, account)
		if ((copy.clearance || []).includes('company') && copy.overrideHash && copy.packetShip) copy.override = true
		delete copy.overrideHash
		delete copy.packetShip
		delete copy.pinSecret
		delete copy.overrideSecret
		return copy
	}

	function mergedAccounts(ship, extras) {
		const accounts = new Map((ship.accounts || []).map(account => [account.id, account]))
		for (const extra of extras || []) accounts.set(extra.id, Object.assign({}, accounts.get(extra.id), extra))
		return [...accounts.values()]
	}

	function present(ship, live, packet, extras) {
		const copy = structuredClone(ship)
		copy.accounts = mergedAccounts(copy, extras).map(function (account) {
			const next = publicAccount(account)
			if (packet) { delete next.pinHash; delete next.pinHashes }
			const row = live.roster[next.id]
			if (row) {
				if (row.status != null) next.status = row.status
				if (row.lastLogin != null) next.lastLogin = row.lastLogin
				if (row.classifiedStatus != null) next.classifiedStatus = row.classifiedStatus
			}
			return next
		})
		copy.systems = live.systems
		copy.announcements = live.announcements
		copy.logs = live.logs
		copy.mail = live.mail
		copy.notes = live.notes
		assignPhotos(copy)
		return copy
	}

	function portraitFiles() {
		const root = path.resolve(shipsRoot, '..', 'client', 'public', 'images')
		const found = []
		if (!fs.existsSync(root)) return found
		for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
			if (!entry.isDirectory() || !(/_crew$/i.test(entry.name) || entry.name === 'generic')) continue
			for (const file of fs.readdirSync(path.join(root, entry.name))) {
				const parsed = path.parse(file)
				if (!/^\.(jpe?g|png|webp)$/i.test(parsed.ext)) continue
				found.push({
					stem: parsed.name.toLowerCase(),
					url: 'images/' + entry.name + '/' + file
				})
			}
		}
		return found
	}

	function portraitSlug(value) {
		return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
	}

	function assignPhotos(ship) {
		const files = portraitFiles()
		const aliases = {
			ava: ['ava_6'],
			miller: ['vanessa_miller']
		}
		for (const account of ship.accounts || []) {
			if (account.photo) continue
			const name = String(account.name || '').trim().toLowerCase()
			const candidates = [portraitSlug(name)].concat(aliases[name] || [])
			for (const candidate of candidates) {
				const hit = files.find(function (file) { return file.stem === candidate })
				if (!hit) continue
				account.photo = hit.url
				break
			}
		}
	}

	function playerShip(code, shipId) {
		const ship = tableShip(code, shipId)
		const presented = withNavigation(present(ship, store.shipState(code, shipId), ship.packet === true, store.extraAccounts(code, shipId)), store.shipConfig(code, shipId))
		presented.date = clock(code)
		return presented
	}

	function homeOf(row) {
		return row.home_ship || row.ship_id
	}

	function shipOpen(row, shipId) {
		const link = store.shipsOf(row.code).find(function (item) { return item.ship_id === shipId })
		return Boolean(link && link.player_access)
	}

	function landingShip(row) {
		const links = store.shipsOf(row.code)
		const home = homeOf(row)
		if (links.some(function (link) { return link.ship_id === home && link.player_access })) return home
		const open = links.find(function (link) { return link.player_access })
		return open ? open.ship_id : ''
	}

	function resolveShip(row, requested) {
		const id = typeof requested === 'string' ? requested.trim().toLowerCase() : ''
		if (id && store.shipKind(row.code, id)) {
			if (!shipOpen(row, id)) fail('That computer is closed', 403)
			return id
		}
		const landing = landingShip(row)
		if (!landing) fail('That computer is closed', 403)
		return landing
	}

	function shipCards(code, playersOnly) {
		return store.shipsOf(code).filter(function (link) {
			if (!playersOnly) return true
			return link.player_access
		}).map(function (link) {
			const ship = tableShip(code, link.ship_id)
			return {
				id: link.ship_id,
				name: ship ? ship.name : link.ship_id,
				computer: ship ? (ship.computer || 'MU/TH/UR') : 'MU/TH/UR',
				playerAccess: Boolean(link.player_access)
			}
		})
	}

	function playerPulses(code) {
		const open = new Set(store.shipsOf(code).filter(function (link) {
			return link.player_access
		}).map(function (link) { return link.ship_id }))
		return store.pulses(code).filter(function (pulse) { return !pulse.shipId || open.has(pulse.shipId) })
	}

	function readTable(rawCode, requestedShip) {
		const row = requireRun(rawCode)
		ensureOverrides(row.code)
		store.touchSeen(row.code, 'player', true)
		const shipId = resolveShip(row, requestedShip)
		return {
			code: row.code,
			revision: row.revision,
			homeShip: homeOf(row),
			ships: shipCards(row.code, true),
			pulses: playerPulses(row.code),
			ship: playerShip(row.code, shipId)
		}
	}

	function readState(rawCode, token, requestedShip) {
		const row = requireRun(rawCode)
		ensureOverrides(row.code)
		store.touchSeen(row.code, 'player', false)
		const fresh = store.run(row.code)
		const shipId = resolveShip(fresh, requestedShip)
		const live = store.shipState(fresh.code, shipId)
		const presented = playerShip(fresh.code, shipId)
		const body = {
			code: fresh.code,
			revision: fresh.revision,
			homeShip: homeOf(fresh),
			ships: shipCards(fresh.code, true),
			pulses: playerPulses(fresh.code),
			shipId: shipId,
			roster: live.roster,
			date: clock(fresh.code),
			name: presented.name,
			computer: presented.computer,
			accounts: presented.accounts,
			blueprints: presented.blueprints,
			starMap: presented.starMap,
			modules: presented.modules,
			systems: live.systems,
			announcements: live.announcements,
			logs: live.logs,
			mail: live.mail,
			notes: live.notes,
			packet: null
		}
		const binding = store.overrideAccount(fresh.code, token, shipId)
		if (binding) {
			const account = accountRecord(fresh.code, shipId, binding.id)
			if (account && (account.clearance || []).includes('company') && account.overrideHash === binding.hash && account.packetShip === binding.target && account.packetShip && store.shipKind(fresh.code, account.packetShip)) body.packet = companyView(fresh.code, account.packetShip)
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
		ensureOverrides(created.code)
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
		const seenMail = new Set()
		const seenNotes = new Set()
		const templateNotesAll = new Set(allShips().flatMap(ship => (ship.notes || []).map(note => note.id)))
		const counts = { playerMail: 0, gmMail: 0, playerNotes: 0, gmNotes: 0, gmLogs: 0 }
		for (const link of store.shipsOf(code)) {
			const scenario = tableShip(code, link.ship_id)
			const live = store.shipState(code, link.ship_id)
			const templateLogs = new Set(((scenario && scenario.logs) || []).map(function (item) { return item.id }))
			const contacts = new Set(((scenario && scenario.contacts) || []).map(function (item) { return item.id }))
			for (const message of live.mail) {
				if (!message.live || seenMail.has(message.id)) continue
				seenMail.add(message.id)
				if (contacts.has(message.from)) counts.gmMail += 1
				else counts.playerMail += 1
			}
			for (const note of live.notes) {
				if (seenNotes.has(note.id)) continue
				seenNotes.add(note.id)
				if (note.private) counts.playerNotes += 1
				else if (!templateNotesAll.has(note.id)) counts.gmNotes += 1
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
		const ship = tableShip(code, shipId)
		const account = mergedAccounts(ship, store.extraAccounts(code, shipId)).find(item => item.id === accountId)
		if (!account) return null
		const live = store.shipState(code, shipId).roster[accountId] || {}
		const current = Object.assign({}, account)
		for (const field of ['status', 'lastLogin', 'classifiedStatus']) if (live[field] != null) current[field] = live[field]
		return current
	}

	function shipFromBody(row, body) {
		const requested = body && typeof body.shipId === 'string' ? body.shipId : ''
		if (requested && store.shipKind(row.code, requested)) {
			if (!shipOpen(row, requested)) fail('That computer is closed', 403)
			return requested
		}
		return homeOf(row)
	}

	function sendMessage(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object') fail('JSON object required', 400)
		const shipId = shipFromBody(row, body)
		const ship = tableShip(row.code, shipId)
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

	const overrideAttempts = new Map()
	function unlock(rawCode, body) {
		const row = requireRun(rawCode)
		if (!body || typeof body !== 'object') fail('JSON object required', 400)
		const shipId = shipFromBody(row, body)
		const ship = tableShip(row.code, shipId)
		const account = accountRecord(row.code, shipId, body.accountId)
		if (!account || !(account.clearance || []).includes('company') || !account.overrideHash || !account.packetShip) fail('No company override on this account', 400)
		const key = row.code + ':' + shipId + ':' + account.id
		const minute = Math.floor(Date.now() / 60000)
		const attempts = overrideAttempts.get(key)
		if (attempts && attempts.minute === minute && attempts.count >= 10) fail('Too many override attempts; try again shortly', 429)
		overrideAttempts.set(key, { minute, count: attempts && attempts.minute === minute ? attempts.count + 1 : 1 })
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
		store.saveOverride(row.code, account.id, token, shipId, account.overrideHash, account.packetShip)
		return { token: token, packet: companyView(row.code, account.packetShip) }
	}

	function applyTransfer(code, spec) {
		if (!spec || typeof spec !== 'object') fail('Transfer is required', 400)
		const fromShip = spec.fromShip
		const toShip = spec.toShip
		const accountId = spec.accountId
		if (!store.shipKind(code, fromShip) || !store.shipKind(code, toShip)) fail('Both ships must be on this table', 400)
		if (fromShip === toShip) fail('Pick a different computer', 400)
		const sourceShip = tableShip(code, fromShip)
		const account = accountRecord(code, fromShip, accountId)
		if (!account || account.id === 'public') fail('Unknown person', 400)
		const registered = accountRecord(code, toShip, accountId)
		const boarded = Object.assign({}, account, registered || {}, {
			listed: true,
			transferred: true,
			status: 'Aboard',
			pinSalt: registered ? registered.pinSalt || tableShip(code, toShip).salt : account.pinSalt || sourceShip.salt
		})
		const visiblePin = gmPin(code, registered ? toShip : fromShip, accountId)
		if (visiblePin && !boarded.pinSecret) boarded.pinSecret = vault.encrypt(visiblePin)
		delete boarded.override
		delete boarded.overrideHash
		delete boarded.packetShip
		delete boarded.overrideSecret
		store.saveExtraAccount(code, toShip, boarded)
		store.patchRoster(code, toShip, { [account.id]: { status: 'Aboard' } })

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
		ensureOverrides(row.code)
		store.touchSeen(row.code, 'gm', true)
		const fresh = store.run(row.code)
		const home = homeOf(fresh)
		const ships = store.shipsOf(fresh.code).map(function (link) {
			const scenario = tableShip(fresh.code, link.ship_id)
			const live = store.shipState(fresh.code, link.ship_id)
			const extras = store.extraAccounts(fresh.code, link.ship_id)
			const presented = withNavigation(present(scenario, live, false, extras), store.shipConfig(fresh.code, link.ship_id))
			const records = new Map(mergedAccounts(scenario, extras).map(account => [account.id, account]))
			const accounts = presented.accounts.filter(account => account.id !== 'public').map(function (account) {
				return {
					id: account.id, name: account.name, job: account.job || '',
					status: account.status || 'Aboard', classifiedStatus: account.classifiedStatus || '',
					clearance: account.clearance || ['crew'], photo: account.photo || '',
					pin: gmPin(fresh.code, link.ship_id, account.id, records.get(account.id)),
					overrideCode: records.get(account.id).overrideSecret ? vault.decrypt(records.get(account.id).overrideSecret) : '',
					overrideTarget: records.get(account.id).packetShip || '',
					hasPin: Boolean(account.pinHash || (account.pinHashes && account.pinHashes.length)),
					transferred: Boolean(account.transferred)
				}
			})
			return {
				id: link.ship_id,
				facility: scenario.facility,
				name: scenario ? scenario.name : link.ship_id,
				computer: scenario ? (scenario.computer || 'MU/TH/UR') : 'MU/TH/UR',
				kind: link.kind,
				playerAccess: Boolean(link.player_access),
				accountId: link.account_id,
				contacts: (scenario && scenario.contacts) || [],
				accounts: accounts,
				logs: live.logs,
				announcements: live.announcements,
				mail: live.mail,
				systemPresets: systemPresets(scenario),
				blueprints: { overview: presented.overview || {}, decks: presented.decks || [], rooms: presented.rooms || {} },
				starMap: presented.starMap,
				cues: store.shipConfig(fresh.code, link.ship_id).cues || [],
				systems: live.systems.map(function (system) {
					return {
						id: system.id,
						name: system.name,
						state: system.state,
						options: system.options || '',
						clearance: system.clearance || 'crew',
						level: system.level || 'NOTICE',
						detail: system.detail || {}
					}
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
			currentDate: clock(fresh.code),
			catalog: [...new Map(listScenarios().ships.concat(ships.map(ship => ({ id: ship.id, name: ship.name, computer: ship.computer }))).map(item => [item.id, item])).values()],
			blueprintImages: blueprintImages(),
			starMapImages: starMapImages(),
			portraits: portraitFiles().filter(portrait => !ships.some(ship => ship.accounts.some(account => account.photo === portrait.url))),
			messages: messages
		}
	}

	function withNavigation(ship, config) {
		if (config.blueprints) Object.assign(ship, config.blueprints)
		ship.blueprints = { overview: ship.overview || {}, decks: ship.decks || [], rooms: ship.rooms || {} }
		ship.starMap = config.starMap || { position: { name: ship.id === 'montero' ? "Sutter's World" : ship.id === 'cronus' ? '26 Draconis' : ship.id === 'astraeus' ? 'XCD-14' : 'Position unconfirmed', x: 50, y: 50 }, locations: [], notes: '', updatedAt: '' }
		ship.modules = ship.modules || []
		if (!ship.modules.some(module => module.id === 'starmap')) ship.modules.push({ id: 'starmap', label: 'Star map' })
		if (ship.decks && ship.decks.length && !ship.modules.some(module => module.id === 'map')) ship.modules.push({ id: 'map', label: 'Blueprints' })
		return ship
	}

	function starMapImages() {
		const root = path.resolve(shipsRoot, '..', 'client', 'public', 'images', 'star_maps')
		return fs.existsSync(root) ? fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name)).map(entry => 'images/star_maps/' + entry.name) : []
	}

	function blueprintImages() {
		const root = path.resolve(shipsRoot, '..', 'client', 'public', 'images')
		return fs.existsSync(root) ? fs.readdirSync(root).filter(file => /\.(png|jpe?g|webp|gif)$/i.test(file)).map(file => 'images/' + file) : []
	}

	function validateBlueprints(blueprints, code) {
		if (!blueprints || typeof blueprints !== 'object' || Array.isArray(blueprints) || JSON.stringify(blueprints).length > 250000) fail('Invalid blueprints')
		function layers(value) {
			if (!value || typeof value !== 'object' || Array.isArray(value)) fail('Blueprint layers must be an object')
			for (const [tag, image] of Object.entries(value)) {
				if (!clearances.includes(tag) || typeof image !== 'string' || image.length > 1000 || (image && !blueprintImages().includes(image) && !validUpload(code, image) && !/^https:\/\/[^\s]+$/.test(image))) fail('Use a listed blueprint image or an HTTPS image URL')
			}
		}
		layers(blueprints.overview)
		if (!Array.isArray(blueprints.decks) || blueprints.decks.length > 30) fail('Invalid decks')
		const ids = new Set()
		for (const deck of blueprints.decks) {
			if (!deck || typeof deck.id !== 'string' || !/^[A-Za-z0-9_-]{1,64}$/.test(deck.id) || ids.has(deck.id) || typeof deck.name !== 'string' || deck.name.length > 200) fail('Invalid or duplicate deck')
			ids.add(deck.id)
			if (!Number.isFinite(deck.width) || !Number.isFinite(deck.height) || deck.width <= 0 || deck.height <= 0 || deck.width > 20000 || deck.height > 20000) fail('Deck dimensions must be between 1 and 20000')
			layers(deck.schematics)
			if (!Array.isArray(deck.hotspots) || deck.hotspots.length > 300) fail('Invalid hotspots')
			for (const spot of deck.hotspots) {
				if (!spot || typeof spot.room !== 'string' || !/^[a-z0-9-]{1,64}$/.test(spot.room) || !['rect', 'circle'].includes(spot.shape) || typeof spot.coords !== 'string' || !/^\d+(?:\.\d+)?(?:,\d+(?:\.\d+)?)+$/.test(spot.coords) || spot.coords.split(',').length !== (spot.shape === 'rect' ? 4 : 3)) fail('Invalid room hotspot coordinates')
			}
		}
		if (!blueprints.rooms || typeof blueprints.rooms !== 'object' || Array.isArray(blueprints.rooms)) fail('Invalid rooms')
		for (const [id, room] of Object.entries(blueprints.rooms)) {
			if (!/^[a-z0-9-]{1,64}$/.test(id) || !room || typeof room.name !== 'string' || room.name.length > 200) fail('Invalid room')
			if (room.requires && (!Array.isArray(room.requires) || room.requires.some(tag => !clearances.includes(tag)))) fail('Invalid room clearance')
			if (room.text && (typeof room.text !== 'object' || Array.isArray(room.text) || Object.entries(room.text).some(([tag, text]) => !clearances.includes(tag) || typeof text !== 'string' || text.length > 4000))) fail('Invalid room details')
		}
	}

	function validateStarMap(map, code, shipId) {
		if (map && map.background != null) {
			const image = map.background
			if (typeof image !== 'string') fail('Invalid map background')
			if (image.startsWith('data:')) {
				const saved = store.shipConfig(code, shipId).starMap
				if (!saved || saved.background !== image) fail('Upload new backgrounds using the image upload control')
			} else if (image && (image.length > 2048 || (!blueprintImages().includes(image) && !starMapImages().includes(image) && !validUpload(code, image) && !/^https:\/\/[^\s]+$/.test(image)))) fail('Use an HTTPS image URL or upload a background')
		}
		if (map && map.showGrid != null && typeof map.showGrid !== 'boolean') fail('Invalid grid visibility')
		if (map && map.backgroundView != null) {
			const view = map.backgroundView
			if (!view || !Number.isFinite(view.zoom) || view.zoom < 1 || view.zoom > 8 || !Number.isFinite(view.x) || !Number.isFinite(view.y) || Math.abs(view.x) > 800 || Math.abs(view.y) > 800) fail('Invalid background pan or zoom')
		}
		if (map && map.backgroundOpacity != null && (!Number.isFinite(map.backgroundOpacity) || map.backgroundOpacity < 0 || map.backgroundOpacity > 1)) fail('Background opacity must be between 0 and 1')
		if (map && map.backgroundFit != null && !['contain', 'cover'].includes(map.backgroundFit)) fail('Invalid background fit')
		if (!map || !map.position || !Array.isArray(map.locations) || map.locations.length > 100 || typeof map.notes !== 'string' || map.notes.length > 4000 || typeof map.updatedAt !== 'string' || map.updatedAt.length > 200) fail('Invalid star map')
		for (const location of [map.position, ...map.locations]) {
			if (!location || typeof location.name !== 'string' || !location.name.trim() || location.name.length > 200 || !Number.isFinite(location.x) || !Number.isFinite(location.y) || location.x < 0 || location.x > 100 || location.y < 0 || location.y > 100) fail('Map locations need a name and coordinates from 0 to 100')
		}
	}

	const clearances = ['public', 'crew', 'security', 'research', 'command', 'company']

	function systemPresets(ship) {
		const common = [
			{ id: 'life-support', name: 'Life support', state: 'Online', options: 'Online;Degraded;Offline;Failed', clearance: 'public', level: 'NOTICE' },
			{ id: 'power', name: 'Power supply', state: 'Online', options: 'Online;Auxiliary power;Offline', clearance: 'crew', level: 'NOTICE' },
			{ id: 'navigation', name: 'Navigation', state: 'Online', options: 'Online;Degraded;Damaged;Offline', clearance: 'crew', level: 'NOTICE' },
			{ id: 'gravity', name: 'Artificial gravity', state: 'Online', options: 'Online;Intermittent;Offline', clearance: 'public', level: 'NOTICE' },
			{ id: 'doors', name: 'Internal doors', state: 'Open', options: 'Open;Closed;Locked;Override', clearance: 'security', level: 'NOTICE' },
			{ id: 'self-destruct', name: 'Self-destruct', state: 'Disarmed', options: 'Disarmed;Armed;Countdown;Aborted', clearance: 'command', level: 'NOTICE' }
		]
		return (ship.systems || []).concat(common).map(item => Object.assign({}, item, { options: statusOptions(item), detail: item.detail || {} }))
	}

	function saveCrew(code, shipId, fields, create) {
		if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fail('Crew record is required')
		const ship = tableShip(code, shipId)
		if (ship.packet) fail('Edit crew on a ship, not a company packet')
		const id = create ? store.newId('crew-') : fields.id
		const existing = create ? null : accountRecord(code, shipId, id)
		if (!create && (!existing || id === 'public')) fail('Unknown crew member')
		const account = Object.assign({}, existing || { id, listed: true })
		for (const field of ['name', 'job', 'status']) {
			if (fields[field] == null && !create) continue
			if (typeof fields[field] !== 'string' || !fields[field].trim() || fields[field].length > 200) fail('Crew ' + field + ' is required (up to 200 characters)')
			account[field] = fields[field].trim()
		}
		if (fields.clearance != null || create) {
			if (!Array.isArray(fields.clearance) || !fields.clearance.length || fields.clearance.some(tag => !clearances.includes(tag))) fail('Select a valid clearance')
			account.clearance = [...new Set(fields.clearance)]
		}
		if (fields.photo != null || create) {
			if (typeof fields.photo !== 'string') fail('Choose a portrait')
			if (fields.photo && fields.photo !== account.photo) {
				if (!portraitFiles().some(portrait => portrait.url === fields.photo)) fail('Unknown portrait')
				const used = store.shipsOf(code).some(link => playerShip(code, link.ship_id).accounts.some(other => other.photo === fields.photo && !(link.ship_id === shipId && other.id === id)))
				if (used) fail('Portrait is already assigned to another crew member')
			}
			account.photo = fields.photo
		}
		if (create || (fields.pin != null && fields.pin !== '')) {
			if (typeof fields.pin !== 'string' || !/^[0-9]{4,12}$/.test(fields.pin)) fail('PIN must contain 4 to 12 digits')
			const hashed = pinHash(account.pinSalt || ship.salt, fields.pin)
			const collision = playerShip(code, shipId).accounts.some(other => other.id !== id && (other.pinHash === pinHash(other.pinSalt || ship.salt, fields.pin) || (other.pinHashes || []).includes(pinHash(other.pinSalt || ship.salt, fields.pin))))
			if (collision || ['1111', '1234'].includes(fields.pin)) fail('PIN is already assigned or reserved for public access')
			account.pinHash = hashed
			account.pinSecret = vault.encrypt(fields.pin)
			delete account.pinHashes
		}
		if (fields.overrideTarget != null || fields.overrideCode) {
			if (!(account.clearance || []).includes('company')) fail('Company clearance is required for override access')
			if (fields.overrideTarget != null) {
				if (fields.overrideTarget && (fields.overrideTarget === shipId || !store.shipKind(code, fields.overrideTarget))) fail('Select another facility on this table')
				account.packetShip = fields.overrideTarget
			}
			if (fields.overrideCode) {
				if (typeof fields.overrideCode !== 'string' || !/^[0-9]{8}$/.test(fields.overrideCode)) fail('Company override must contain exactly 8 digits')
				account.overrideHash = pinHash(ship.salt, fields.overrideCode)
				account.overrideSecret = vault.encrypt(fields.overrideCode)
			}
		}
		store.saveExtraAccount(code, shipId, account)
		store.patchRoster(code, shipId, { [id]: { status: account.status } })
	}

	function editDocument(code, shipId, table, fields, remove) {
		const documents = store.shipState(code, shipId)[table]
		if (remove) {
			if (!documents.some(item => item.id === fields)) fail('Entry not found', 404)
			store.replaceDocs(code, shipId, table, documents.filter(item => item.id !== fields))
			return
		}
		if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fail('Entry is required')
		const existing = fields.id ? documents.find(item => item.id === fields.id) : null
		if (fields.id && !existing) fail('Entry not found', 404)
		const item = Object.assign({}, existing || { id: store.newId(table.slice(0, 1)), live: true })
		const keys = table === 'logs' ? ['text', 'time'] : table === 'mail' ? ['subject', 'from', 'to', 'body', 'time'] : ['title', 'from', 'body', 'time']
		for (const key of keys) {
			const value = fields[key] == null ? item[key] || '' : fields[key]
			if (typeof value !== 'string' || value.length > (key === 'body' || key === 'text' ? 4000 : 200)) fail('Invalid ' + key)
			item[key] = value.trim()
		}
		if (!item[table === 'logs' ? 'text' : 'body']) fail('Entry text is required')
		if (table === 'mail' && (!item.subject || !item.from)) fail('Mail subject and sender are required')
		if (table === 'announcements' && !item.title) fail('Announcement title is required')
		if (fields.clearance != null) {
			if (!Array.isArray(fields.clearance) || !fields.clearance.length || fields.clearance.some(tag => !clearances.includes(tag))) fail('Select valid visibility')
			item.clearance = [...new Set(fields.clearance)]
		} else if (table !== 'mail') item.clearance = item.clearance || ['crew']
		if (existing) store.replaceDocs(code, shipId, table, documents.map(doc => doc.id === item.id ? item : doc))
		else store.insertDoc(code, shipId, table, item)
	}

	function validateCue(cue) {
		if (!cue || typeof cue !== 'object' || typeof cue.name !== 'string' || !cue.name.trim() || cue.name.length > 200 || !cue.changes || typeof cue.changes !== 'object' || Array.isArray(cue.changes) || JSON.stringify(cue.changes).length > 50000) fail('Prepared event needs a name and changes')
		const allowed = ['systems', 'roster', 'saveLog', 'saveAnnouncement', 'saveMail']
		const keys = Object.keys(cue.changes)
		if (!keys.length || keys.some(key => !allowed.includes(key))) fail('Prepared events support systems, roster, logs, announcements and mail')
		for (const key of keys) {
			if (!cue.changes[key] || typeof cue.changes[key] !== 'object' || Array.isArray(cue.changes[key])) fail('Invalid prepared change')
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
			const ship = tableShip(code, id)
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
		let cueConfig = null
		let pushedCue = null
		if (body.runCue) {
			if (!store.shipKind(row.code, shipId)) fail('Ship is not on this table')
			cueConfig = store.shipConfig(row.code, shipId)
			pushedCue = (cueConfig.cues || []).find(cue => cue.id === body.runCue)
			if (!pushedCue) fail('Prepared event not found', 404)
			validateCue(pushedCue)
			body = Object.assign({ shipId }, pushedCue.changes)
		}

		const pulseShip = body.transfer && body.transfer.toShip && !body.systems && !body.roster && !body.appendLog && !body.appendMail && !body.deleteSystem
			? body.transfer.toShip
			: shipId
		let dirty = false
		const modules = []
		function mark(module) { modules.push(module) }
		store.mutate(row.code, pulseShip, modules, function () {
			if (body.baseDate != null || body.advanceMinutes != null) {
				let date = clock(row.code)
				if (body.baseDate != null) {
					if (typeof body.baseDate !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?Z$/.test(body.baseDate) || !Number.isFinite(Date.parse(body.baseDate))) fail('Enter a valid table date')
					date = new Date(body.baseDate).toISOString()
					if (date.slice(0, 16) !== body.baseDate.slice(0, 16)) fail('Enter a valid table date')
				} else {
					if (![5, 30, 60, 120, 180, 300].includes(body.advanceMinutes)) fail('Invalid clock advance')
					date = new Date(Date.parse(date) + body.advanceMinutes * 60000).toISOString()
				}
				const settings = store.tableSettings(row.code)
				store.saveTableSettings(row.code, Object.assign(settings, { baseDate: date, anchor: Date.now() }))
				dirty = true
			}
			if (body.createFacility) {
				const facility = validateFacility(body.createFacility)
				const id = store.newId('facility-')
				store.saveShipConfig(row.code, id, { facility })
				store.attachShip(row.code, tableShip(row.code, id), 'facility', null)
				dirty = true
			}
			if (body.facility) {
				if (!store.shipKind(row.code, shipId)) fail('Facility is not on this table')
				const config = store.shipConfig(row.code, shipId)
				config.facility = validateFacility(body.facility)
				store.saveShipConfig(row.code, shipId, config)
				dirty = true
			}
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
			if (body.access && typeof body.access === 'object' && !Array.isArray(body.access)) {
				for (const [id, open] of Object.entries(body.access)) {
					if (!store.shipKind(row.code, id)) fail('Ship is not on this table', 400)
					store.setPlayerAccess(row.code, id, Boolean(open))
					dirty = true
				}
			}
			if (body.transfer) {
				applyTransfer(row.code, body.transfer)
				dirty = true
				mark('mail')
				mark('notes')
			}
			const content = body.saveCue || body.deleteCue || body.blueprints || body.starMap || body.createCrew || body.updateCrew || body.saveLog || body.deleteLog || body.saveAnnouncement || body.deleteAnnouncement || body.saveMail || body.deleteMail || body.roster || body.systems || body.announcements || body.logs || body.mail || body.notes || body.appendLog || body.appendMail || body.deleteSystem
			if (content) {
				if (!store.shipKind(row.code, shipId)) fail('Ship is not on this table', 400)
			}
			if (body.saveCue || body.deleteCue) {
				const config = store.shipConfig(row.code, shipId)
				const cues = config.cues || []
				if (body.saveCue) {
					validateCue(body.saveCue)
					const existing = body.saveCue.id && cues.find(cue => cue.id === body.saveCue.id)
					if (body.saveCue.id && !existing) fail('Prepared event not found', 404)
					if (!existing && cues.length >= 100) fail('Too many prepared events')
					const cue = { id: existing ? existing.id : store.newId('cue-'), name: body.saveCue.name.trim(), changes: body.saveCue.changes, lastPushedAt: existing ? existing.lastPushedAt || '' : '' }
					config.cues = existing ? cues.map(item => item.id === cue.id ? cue : item) : cues.concat(cue)
				} else {
					if (!cues.some(cue => cue.id === body.deleteCue)) fail('Prepared event not found', 404)
					config.cues = cues.filter(cue => cue.id !== body.deleteCue)
				}
				store.saveShipConfig(row.code, shipId, config)
				dirty = true
			}
			if (body.blueprints || body.starMap) {
				const config = store.shipConfig(row.code, shipId)
				if (body.blueprints) { validateBlueprints(body.blueprints, row.code); config.blueprints = body.blueprints; mark('map') }
				if (body.starMap) { validateStarMap(body.starMap, row.code, shipId); config.starMap = body.starMap; mark('starmap') }
				store.saveShipConfig(row.code, shipId, config)
			}
			if (body.createCrew || body.updateCrew) {
				saveCrew(row.code, shipId, body.createCrew || body.updateCrew, Boolean(body.createCrew))
				mark('personnel')
			}
			for (const [suffix, table] of [['Log', 'logs'], ['Announcement', 'announcements'], ['Mail', 'mail']]) {
				if (body['save' + suffix]) { editDocument(row.code, shipId, table, body['save' + suffix], false); mark(table) }
				if (body['delete' + suffix]) { editDocument(row.code, shipId, table, body['delete' + suffix], true); mark(table) }
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
					time: typeof entry.time === 'string' ? entry.time.trim().slice(0, 200) : stamp(),
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
			if (pushedCue) {
				pushedCue.lastPushedAt = new Date().toISOString()
				store.saveShipConfig(row.code, shipId, cueConfig)
			}
			if (!dirty && !modules.length) fail('Nothing to update', 400)
		})
		ensureOverrides(row.code)
		return gmDetail(row.code)
	}

	function deleteTable(rawCode) {
		const row = requireRun(rawCode)
		store.deleteRun(row.code)
		fs.rmSync(path.join(path.resolve(options.dataDir), 'uploads', row.code), { recursive: true, force: true })
		return { ok: true, code: row.code }
	}

	return {
		uploadImage: uploadImage,
		readImage: readImage,
		listScenarios: listScenarios,
		createTable: createTable,
		listTables: listTables,
		deleteTable: deleteTable,
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
