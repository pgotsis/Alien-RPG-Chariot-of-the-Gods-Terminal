'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')

const emitWarning = process.emitWarning
process.emitWarning = function (...args) {
	const warning = args[0]
	const type = args[1]
	const message = typeof warning === 'string' ? warning : (warning && warning.message) || ''
	const name = typeof warning === 'string' ? type : (warning && warning.name)
	if (name === 'ExperimentalWarning' && /SQLite/i.test(message)) return
	return emitWarning.apply(process, args)
}

const { DatabaseSync } = require('node:sqlite')

const SHIP_ID = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/
const TABLE_CODE = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const MAX_TEXT = 4000
const MAX_ROWS = 500
const DOC_TABLES = new Set(['announcements', 'logs', 'mail', 'notes'])

function fail(message) {
	const err = new Error(message)
	err.statusCode = 400
	throw err
}

function assertId(value, label) {
	if (typeof value !== 'string' || !SHIP_ID.test(value)) fail('Invalid ' + label)
}

function text(value, label) {
	if (value == null) return null
	if (typeof value !== 'string') fail(label + ' must be a string')
	if (value.length > MAX_TEXT) fail(label + ' is too long')
	return value
}

function stamp() {
	return new Date().toISOString()
}

function newCode(db) {
	for (let attempt = 0; attempt < 8; attempt++) {
		const bytes = crypto.randomBytes(6)
		let code = ''
		for (let i = 0; i < 6; i++) code += ALPHABET[bytes[i] % ALPHABET.length]
		const existing = db.prepare('SELECT code FROM runs WHERE code = ?').get(code)
		if (!existing) return code
	}
	fail('Could not allocate a table code')
}

function newId(prefix) {
	return prefix + crypto.randomBytes(4).toString('hex')
}

function openDatabase(file) {
	const db = new DatabaseSync(file)
	db.exec(`
		PRAGMA journal_mode = WAL;
		PRAGMA busy_timeout = 5000;
		CREATE TABLE IF NOT EXISTS runs (
			code TEXT PRIMARY KEY,
			ship_id TEXT NOT NULL,
			created_at TEXT NOT NULL,
			revision INTEGER NOT NULL,
			comment TEXT NOT NULL DEFAULT '',
			player_seen_at TEXT,
			gm_seen_at TEXT,
			home_ship TEXT
		);
		CREATE TABLE IF NOT EXISTS run_ships (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			kind TEXT NOT NULL,
			account_id TEXT,
			player_access INTEGER NOT NULL DEFAULT 0,
			PRIMARY KEY (code, ship_id)
		);
		CREATE TABLE IF NOT EXISTS roster (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			account_id TEXT NOT NULL,
			status TEXT,
			last_login TEXT,
			classified_status TEXT,
			PRIMARY KEY (code, ship_id, account_id)
		);
		CREATE TABLE IF NOT EXISTS systems (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			id TEXT NOT NULL,
			name TEXT NOT NULL,
			state TEXT NOT NULL,
			detail TEXT NOT NULL,
			options TEXT NOT NULL DEFAULT '',
			clearance TEXT NOT NULL DEFAULT 'crew',
			level TEXT NOT NULL DEFAULT 'NOTICE',
			position INTEGER NOT NULL,
			PRIMARY KEY (code, ship_id, id)
		);
		CREATE TABLE IF NOT EXISTS announcements (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			id TEXT NOT NULL,
			document TEXT NOT NULL,
			position INTEGER NOT NULL,
			PRIMARY KEY (code, ship_id, id)
		);
		CREATE TABLE IF NOT EXISTS logs (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			id TEXT NOT NULL,
			document TEXT NOT NULL,
			position INTEGER NOT NULL,
			PRIMARY KEY (code, ship_id, id)
		);
		CREATE TABLE IF NOT EXISTS mail (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			id TEXT NOT NULL,
			document TEXT NOT NULL,
			position INTEGER NOT NULL,
			PRIMARY KEY (code, ship_id, id)
		);
		CREATE TABLE IF NOT EXISTS notes (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			id TEXT NOT NULL,
			document TEXT NOT NULL,
			position INTEGER NOT NULL,
			PRIMARY KEY (code, ship_id, id)
		);
		CREATE TABLE IF NOT EXISTS pulses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			code TEXT NOT NULL,
			ship_id TEXT,
			module TEXT NOT NULL,
			created_at TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS ship_config (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			document TEXT NOT NULL,
			PRIMARY KEY (code, ship_id)
		);
		CREATE TABLE IF NOT EXISTS extra_accounts (
			code TEXT NOT NULL,
			ship_id TEXT NOT NULL,
			account_id TEXT NOT NULL,
			document TEXT NOT NULL,
			PRIMARY KEY (code, ship_id, account_id)
		);
		CREATE TABLE IF NOT EXISTS override_tokens (
			code TEXT NOT NULL,
			account_id TEXT NOT NULL,
			token_hash TEXT NOT NULL,
			PRIMARY KEY (code, account_id)
		);
	`)
	ensureColumn(db, 'runs', 'comment', "comment TEXT NOT NULL DEFAULT ''")
	ensureColumn(db, 'runs', 'player_seen_at', 'player_seen_at TEXT')
	ensureColumn(db, 'runs', 'gm_seen_at', 'gm_seen_at TEXT')
	ensureColumn(db, 'runs', 'home_ship', 'home_ship TEXT')
	ensureColumn(db, 'systems', 'options', "options TEXT NOT NULL DEFAULT ''")
	const addedClearance = ensureColumn(db, 'systems', 'clearance', "clearance TEXT NOT NULL DEFAULT 'crew'")
	const addedLevel = ensureColumn(db, 'systems', 'level', "level TEXT NOT NULL DEFAULT 'NOTICE'")
	if (addedClearance || addedLevel) {
		const presets = {
			airlock: { clearance: 'public', level: 'NOTICE' },
			scrubbers: { clearance: 'public', level: 'WARNING' },
			ftl: { clearance: 'crew', level: 'CRITICAL' },
			comms: { clearance: 'public', level: 'WARNING' },
			cryo: { clearance: 'crew', level: 'NOTICE' },
			reactor: { clearance: 'security', level: 'CRITICAL' },
			'science-module': { clearance: 'public', level: 'WARNING' },
			haulage: { clearance: 'public', level: 'CRITICAL' },
			distress: { clearance: 'public', level: 'WARNING' },
			lucidite: { clearance: 'public', level: 'CRITICAL' },
			impulse: { clearance: 'public', level: 'CRITICAL' },
			shields: { clearance: 'public', level: 'WARNING' },
			xenospace: { clearance: 'public', level: 'CRITICAL' }
		}
		const update = db.prepare('UPDATE systems SET clearance = ?, level = ? WHERE id = ?')
		for (const [id, fields] of Object.entries(presets)) {
			update.run(fields.clearance, fields.level, id)
		}
	}
	ensureColumn(db, 'pulses', 'ship_id', 'ship_id TEXT')
	const addedAccess = ensureColumn(db, 'run_ships', 'player_access', 'player_access INTEGER NOT NULL DEFAULT 0')
	db.exec(`UPDATE pulses SET ship_id = (
		SELECT ship_id FROM runs WHERE runs.code = pulses.code
	) WHERE ship_id IS NULL`)
	db.exec("UPDATE runs SET home_ship = ship_id WHERE home_ship IS NULL OR home_ship = ''")
	if (addedAccess) {
		db.exec(`UPDATE run_ships SET player_access = 1 WHERE ship_id = (
			SELECT home_ship FROM runs WHERE runs.code = run_ships.code
		)`)
	}
	const blank = db.prepare('SELECT code, ship_id, id, state FROM systems WHERE options IS NULL OR options = \'\'').all()
	const fill = db.prepare('UPDATE systems SET options = ? WHERE code = ? AND ship_id = ? AND id = ?')
	for (const row of blank) fill.run(statusOptions(row), row.code, row.ship_id, row.id)
	return db
}

function ensureColumn(db, table, name, definition) {
	const cols = db.prepare('PRAGMA table_info(' + table + ')').all()
	if (!cols.some(function (col) { return col.name === name })) {
		db.exec('ALTER TABLE ' + table + ' ADD COLUMN ' + definition)
		return true
	}
	return false
}

const STATUS_PRESETS = {
	airlock: 'Open;Closed;Cycling;Locked',
	scrubbers: '100% efficiency;20% efficiency;Offline;Failed',
	ftl: 'Online;Standby;Offline;Engaged',
	comms: 'Online;Degraded;Damaged;Offline',
	cryo: 'Open;Secured;Locked;Offline',
	reactor: 'Online;Standby;Fault;Offline;Critical',
	'science-module': 'Docked;Ejected;Offline',
	haulage: 'Online;Loaded;Derelict;Offline',
	distress: 'Silent;Transmitting;Intermittent;Offline'
}

function statusOptions(item) {
	const written = typeof item.options === 'string' ? item.options.trim() : ''
	const preset = written || STATUS_PRESETS[item.id] || 'Offline;Standby;Online'
	const state = item.state == null ? '' : String(item.state)
	if (state && preset.split(';').map(function (part) { return part.trim() }).indexOf(state) === -1) {
		return state + ';' + preset
	}
	return preset
}

const STATUS_LEVELS = ['NOTICE', 'WARNING', 'CRITICAL']
const STATUS_CLEARANCES = ['public', 'crew', 'security', 'research', 'command', 'company']

function normalizeLevel(value) {
	const level = String(value || '').trim().toUpperCase()
	return STATUS_LEVELS.indexOf(level) === -1 ? 'NOTICE' : level
}

function normalizeClearance(value) {
	const clearance = String(value || '').trim().toLowerCase()
	return STATUS_CLEARANCES.indexOf(clearance) === -1 ? 'crew' : clearance
}

function normalizeOptions(value) {
	const raw = String(value || '')
	const parts = (raw.indexOf(';') === -1 ? raw.split(',') : raw.split(';'))
		.map(function (part) { return part.trim() })
		.filter(Boolean)
	return parts.join(';').slice(0, 4000)
}

function createStore(dataDir) {
	const root = path.resolve(dataDir)
	let db = null

	function database() {
		if (!db) {
			fs.mkdirSync(root, { recursive: true })
			db = openDatabase(path.join(root, 'app.sqlite'))
		}
		return db
	}

	function run(code) {
		if (!TABLE_CODE.test(code)) return null
		return database().prepare(
			'SELECT code, ship_id, created_at, revision, comment, player_seen_at, gm_seen_at, home_ship FROM runs WHERE code = ?'
		).get(code) || null
	}

	function shipsOf(code) {
		return database().prepare(`
			SELECT ship_id, kind, account_id, player_access FROM run_ships
			WHERE code = ?
			ORDER BY CASE kind WHEN 'primary' THEN 0 ELSE 1 END, ship_id
		`).all(code)
	}

	function shipKind(code, shipId) {
		const row = database().prepare('SELECT kind FROM run_ships WHERE code = ? AND ship_id = ?').get(code, shipId)
		return row ? row.kind : null
	}

	function docs(table, code, shipId) {
		return database().prepare(
			'SELECT document FROM ' + table + ' WHERE code = ? AND ship_id = ? ORDER BY position, id'
		).all(code, shipId).map(function (row) { return JSON.parse(row.document) })
	}

	function shipState(code, shipId) {
		const roster = {}
		for (const row of database().prepare(
			'SELECT account_id, status, last_login, classified_status FROM roster WHERE code = ? AND ship_id = ?'
		).all(code, shipId)) {
			roster[row.account_id] = {
				status: row.status,
				lastLogin: row.last_login,
				classifiedStatus: row.classified_status
			}
		}
		return {
			roster: roster,
			systems: database().prepare(
				'SELECT id, name, state, options, clearance, level, detail FROM systems WHERE code = ? AND ship_id = ? ORDER BY position, id'
			).all(code, shipId).map(function (row) {
				return {
					id: row.id,
					name: row.name,
					state: row.state,
					options: row.options,
					clearance: normalizeClearance(row.clearance),
					level: normalizeLevel(row.level),
					detail: JSON.parse(row.detail)
				}
			}),
			announcements: docs('announcements', code, shipId),
			logs: docs('logs', code, shipId),
			mail: docs('mail', code, shipId),
			notes: docs('notes', code, shipId)
		}
	}

	function pulses(code) {
		return database().prepare(
			'SELECT id, ship_id, module, created_at FROM pulses WHERE code = ? ORDER BY id'
		).all(code).map(function (row) {
			return { id: row.id, shipId: row.ship_id, module: row.module, createdAt: row.created_at }
		})
	}

	function seedShip(code, ship) {
		const accounts = Array.isArray(ship.accounts) ? ship.accounts : []
		const roster = database().prepare(
			'INSERT INTO roster (code, ship_id, account_id, status, last_login, classified_status) VALUES (?, ?, ?, ?, ?, ?)'
		)
		const seen = new Set()
		for (const account of accounts) {
			if (!account || typeof account.id !== 'string' || !SHIP_ID.test(account.id) || seen.has(account.id)) continue
			seen.add(account.id)
			roster.run(
				code,
				ship.id,
				account.id,
				account.status == null ? null : String(account.status).slice(0, MAX_TEXT),
				account.lastLogin == null ? null : String(account.lastLogin).slice(0, MAX_TEXT),
				account.classifiedStatus == null ? null : String(account.classifiedStatus).slice(0, MAX_TEXT)
			)
		}
		const system = database().prepare(
			'INSERT INTO systems (code, ship_id, id, name, state, detail, options, clearance, level, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
		)
		;(Array.isArray(ship.systems) ? ship.systems : []).forEach(function (item, index) {
			if (!item || typeof item.id !== 'string' || !SHIP_ID.test(item.id)) return
			system.run(
				code,
				ship.id,
				item.id,
				String(item.name || item.id).slice(0, MAX_TEXT),
				String(item.state || '').slice(0, MAX_TEXT),
				JSON.stringify(item.detail || {}),
				statusOptions(item).slice(0, MAX_TEXT),
				normalizeClearance(item.clearance),
				normalizeLevel(item.level),
				index
			)
		})
		for (const table of DOC_TABLES) {
			const insert = database().prepare(
				'INSERT INTO ' + table + ' (code, ship_id, id, document, position) VALUES (?, ?, ?, ?, ?)'
			)
			const items = Array.isArray(ship[table]) ? ship[table] : []
			items.forEach(function (item, index) {
				if (!item || typeof item.id !== 'string' || !SHIP_ID.test(item.id)) return
				insert.run(code, ship.id, item.id, JSON.stringify(item), index)
			})
		}
	}

	function createRun(primary, packets) {
		assertId(primary.id, 'ship id')
		database().exec('BEGIN IMMEDIATE')
		try {
			const code = newCode(database())
			database().prepare(
				'INSERT INTO runs (code, ship_id, created_at, revision, comment, home_ship) VALUES (?, ?, ?, 1, \'\', ?)'
			).run(code, primary.id, stamp(), primary.id)
			database().prepare(
				'INSERT INTO run_ships (code, ship_id, kind, account_id, player_access) VALUES (?, ?, ?, ?, 1)'
			).run(code, primary.id, 'primary', null)
			seedShip(code, primary)
			for (const packet of packets || []) {
				assertId(packet.ship.id, 'packet ship id')
				assertId(packet.accountId, 'account id')
				database().prepare('INSERT INTO run_ships (code, ship_id, kind, account_id) VALUES (?, ?, ?, ?)').run(
					code, packet.ship.id, 'packet', packet.accountId
				)
				seedShip(code, packet.ship)
			}
			database().exec('COMMIT')
			return { code: code, shipId: primary.id, createdAt: stamp() }
		} catch (err) {
			database().exec('ROLLBACK')
			throw err
		}
	}

	function listRuns() {
		return database().prepare(
			'SELECT code, ship_id, created_at, revision, comment, player_seen_at, gm_seen_at, home_ship FROM runs ORDER BY created_at DESC'
		).all()
	}

	function addPulse(code, shipId, module) {
		database().prepare('INSERT INTO pulses (code, ship_id, module, created_at) VALUES (?, ?, ?, ?)').run(code, shipId, module, stamp())
	}

	function bump(code, shipId, modules) {
		const unique = [...new Set(modules)]
		for (const module of unique) addPulse(code, shipId, module)
		database().prepare('UPDATE runs SET revision = revision + 1 WHERE code = ?').run(code)
	}

	function replaceDocs(code, shipId, table, items) {
		if (!DOC_TABLES.has(table)) fail('Unknown document table')
		if (!Array.isArray(items)) fail(table + ' must be an array')
		if (items.length > MAX_ROWS) fail('Too many ' + table)
		const seen = new Set()
		for (const item of items) {
			if (!item || typeof item !== 'object' || Array.isArray(item)) fail('Invalid ' + table + ' entry')
			assertId(item.id, table + ' id')
			if (seen.has(item.id)) fail('Duplicate ' + table + ' id')
			seen.add(item.id)
			if (JSON.stringify(item).length > 20000) fail(table + ' entry is too large')
		}
		database().prepare('DELETE FROM ' + table + ' WHERE code = ? AND ship_id = ?').run(code, shipId)
		const insert = database().prepare('INSERT INTO ' + table + ' (code, ship_id, id, document, position) VALUES (?, ?, ?, ?, ?)')
		items.forEach(function (item, index) {
			insert.run(code, shipId, item.id, JSON.stringify(item), index)
		})
	}

	function nextPosition(table, code, shipId) {
		const row = database().prepare('SELECT COALESCE(MAX(position), -1) + 1 AS pos FROM ' + table + ' WHERE code = ? AND ship_id = ?').get(code, shipId)
		return row.pos
	}

	function insertDoc(code, shipId, table, document) {
		assertId(document.id, table + ' id')
		if (JSON.stringify(document).length > 20000) fail(table + ' entry is too large')
		database().prepare('INSERT INTO ' + table + ' (code, ship_id, id, document, position) VALUES (?, ?, ?, ?, ?)').run(
			code, shipId, document.id, JSON.stringify(document), nextPosition(table, code, shipId)
		)
	}

	function patchRoster(code, shipId, roster) {
		if (!roster || typeof roster !== 'object' || Array.isArray(roster)) fail('roster must be an object')
		const upsert = database().prepare(`
			INSERT INTO roster (code, ship_id, account_id, status, last_login, classified_status)
			VALUES (@code, @shipId, @id, @status, @lastLogin, @classifiedStatus)
			ON CONFLICT(code, ship_id, account_id) DO UPDATE SET
				status = COALESCE(@status, roster.status),
				last_login = COALESCE(@lastLogin, roster.last_login),
				classified_status = COALESCE(@classifiedStatus, roster.classified_status)
		`)
		for (const [id, fields] of Object.entries(roster)) {
			assertId(id, 'account id')
			if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fail('Invalid roster entry')
			upsert.run({
				code: code,
				shipId: shipId,
				id: id,
				status: text(fields.status, 'status'),
				lastLogin: text(fields.lastLogin, 'lastLogin'),
				classifiedStatus: text(fields.classifiedStatus, 'classifiedStatus')
			})
		}
	}

	function patchSystems(code, shipId, systems) {
		if (!systems || typeof systems !== 'object' || Array.isArray(systems)) fail('systems must be an object')
		const update = database().prepare(`
			UPDATE systems
			SET name = COALESCE(?, name),
				state = COALESCE(?, state),
				detail = COALESCE(?, detail),
				options = COALESCE(?, options),
				clearance = COALESCE(?, clearance),
				level = COALESCE(?, level)
			WHERE code = ? AND ship_id = ? AND id = ?
		`)
		const insert = database().prepare(`
			INSERT INTO systems (code, ship_id, id, name, state, detail, options, clearance, level, position)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`)
		for (const [id, fields] of Object.entries(systems)) {
			assertId(id, 'system id')
			if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fail('Invalid system entry')
			const name = text(fields.name, 'name')
			const state = text(fields.state, 'state')
			const options = fields.options == null ? null : normalizeOptions(fields.options)
			const clearance = fields.clearance == null ? null : normalizeClearance(fields.clearance)
			const level = fields.level == null ? null : normalizeLevel(fields.level)
			let detail = null
			if (fields.detail != null) {
				if (typeof fields.detail !== 'object' || Array.isArray(fields.detail)) fail('detail must be an object')
				detail = JSON.stringify(fields.detail)
				if (detail.length > 20000) fail('detail is too large')
			}
			const existing = database().prepare('SELECT id FROM systems WHERE code = ? AND ship_id = ? AND id = ?').get(code, shipId, id)
			if (existing) update.run(name, state, detail, options, clearance, level, code, shipId, id)
			else {
				insert.run(
					code,
					shipId,
					id,
					name || id,
					state || '',
					detail || '{}',
					options || statusOptions({ id: id, state: state || '' }),
					clearance || 'crew',
					level || 'NOTICE',
					nextPosition('systems', code, shipId)
				)
			}
		}
	}

	function deleteRun(code) {
		const row = run(code)
		if (!row) fail('Table not found', 404)
		database().exec('BEGIN IMMEDIATE')
		try {
			for (const table of [
				'roster', 'systems', 'announcements', 'logs', 'mail', 'notes',
				'extra_accounts', 'ship_config', 'run_ships', 'pulses', 'override_tokens'
			]) {
				database().prepare('DELETE FROM ' + table + ' WHERE code = ?').run(code)
			}
			database().prepare('DELETE FROM runs WHERE code = ?').run(code)
			database().exec('COMMIT')
		} catch (err) {
			database().exec('ROLLBACK')
			throw err
		}
	}

	function deleteSystem(code, shipId, id) {
		assertId(id, 'system id')
		database().prepare('DELETE FROM systems WHERE code = ? AND ship_id = ? AND id = ?').run(code, shipId, id)
	}

	function setComment(code, comment) {
		database().prepare('UPDATE runs SET comment = ? WHERE code = ?').run(String(comment).slice(0, MAX_TEXT), code)
	}

	function touchSeen(code, who, force) {
		const column = who === 'gm' ? 'gm_seen_at' : 'player_seen_at'
		const row = run(code)
		if (!row) return
		if (!force && who === 'player' && row.player_seen_at) {
			const then = Date.parse(row.player_seen_at)
			if (!Number.isNaN(then) && Date.now() - then < 60000) return
		}
		database().prepare('UPDATE runs SET ' + column + ' = ? WHERE code = ?').run(stamp(), code)
	}

	function setHome(code, shipId) {
		assertId(shipId, 'ship id')
		database().prepare('UPDATE runs SET home_ship = ?, ship_id = ? WHERE code = ?').run(shipId, shipId, code)
		database().prepare('UPDATE run_ships SET player_access = 1 WHERE code = ? AND ship_id = ?').run(code, shipId)
	}

	function setPlayerAccess(code, shipId, open) {
		assertId(shipId, 'ship id')
		const result = database().prepare(
			'UPDATE run_ships SET player_access = ? WHERE code = ? AND ship_id = ?'
		).run(open ? 1 : 0, code, shipId)
		if (!result.changes) fail('Ship is not on this table')
	}

	function attachShip(code, ship, kind, accountId) {
		assertId(ship.id, 'ship id')
		const existing = database().prepare('SELECT ship_id FROM run_ships WHERE code = ? AND ship_id = ?').get(code, ship.id)
		if (existing) return
		database().prepare('INSERT INTO run_ships (code, ship_id, kind, account_id) VALUES (?, ?, ?, ?)').run(
			code, ship.id, kind || 'ship', accountId || null
		)
		seedShip(code, ship)
	}

	function dropShip(code, shipId) {
		assertId(shipId, 'ship id')
		for (const table of ['roster', 'systems', 'announcements', 'logs', 'mail', 'notes', 'extra_accounts', 'ship_config']) {
			database().prepare('DELETE FROM ' + table + ' WHERE code = ? AND ship_id = ?').run(code, shipId)
		}
		database().prepare('DELETE FROM run_ships WHERE code = ? AND ship_id = ?').run(code, shipId)
		database().prepare('DELETE FROM pulses WHERE code = ? AND ship_id = ?').run(code, shipId)
	}

	function shipConfig(code, shipId) {
		const row = database().prepare('SELECT document FROM ship_config WHERE code = ? AND ship_id = ?').get(code, shipId)
		return row ? JSON.parse(row.document) : {}
	}

	function saveShipConfig(code, shipId, config) {
		database().prepare('INSERT INTO ship_config (code, ship_id, document) VALUES (?, ?, ?) ON CONFLICT(code, ship_id) DO UPDATE SET document = excluded.document').run(code, shipId, JSON.stringify(config))
	}

	function extraAccounts(code, shipId) {
		return database().prepare(
			'SELECT document FROM extra_accounts WHERE code = ? AND ship_id = ?'
		).all(code, shipId).map(function (row) { return JSON.parse(row.document) })
	}

	function saveExtraAccount(code, shipId, account) {
		assertId(account.id, 'account id')
		database().prepare(`
			INSERT INTO extra_accounts (code, ship_id, account_id, document) VALUES (?, ?, ?, ?)
			ON CONFLICT(code, ship_id, account_id) DO UPDATE SET document = excluded.document
		`).run(code, shipId, account.id, JSON.stringify(account))
	}

	function upsertNote(code, shipId, document) {
		const existing = database().prepare('SELECT position FROM notes WHERE code = ? AND ship_id = ? AND id = ?').get(code, shipId, document.id)
		if (existing) {
			database().prepare('UPDATE notes SET document = ? WHERE code = ? AND ship_id = ? AND id = ?').run(
				JSON.stringify(document), code, shipId, document.id
			)
			return
		}
		insertDoc(code, shipId, 'notes', document)
	}

	function mutate(code, shipId, modules, work) {
		database().exec('BEGIN IMMEDIATE')
		try {
			work()
			bump(code, shipId, modules)
			database().exec('COMMIT')
		} catch (err) {
			database().exec('ROLLBACK')
			throw err
		}
	}

	function saveOverride(code, accountId, token) {
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
		database().prepare(`
			INSERT INTO override_tokens (code, account_id, token_hash) VALUES (?, ?, ?)
			ON CONFLICT(code, account_id) DO UPDATE SET token_hash = excluded.token_hash
		`).run(code, accountId, tokenHash)
	}

	function overrideAccount(code, token) {
		if (!token) return null
		const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex')
		const rows = database().prepare('SELECT account_id, token_hash FROM override_tokens WHERE code = ?').all(code)
		for (const row of rows) {
			const got = Buffer.from(tokenHash)
			const expected = Buffer.from(row.token_hash)
			if (got.length === expected.length && crypto.timingSafeEqual(got, expected)) return row.account_id
		}
		return null
	}

	return {
		run: run,
		shipsOf: shipsOf,
		shipKind: shipKind,
		shipState: shipState,
		pulses: pulses,
		createRun: createRun,
		listRuns: listRuns,
		replaceDocs: replaceDocs,
		patchRoster: patchRoster,
		patchSystems: patchSystems,
		deleteSystem: deleteSystem,
		deleteRun: deleteRun,
		setComment: setComment,
		touchSeen: touchSeen,
		setHome: setHome,
		setPlayerAccess: setPlayerAccess,
		attachShip: attachShip,
		dropShip: dropShip,
		shipConfig: shipConfig,
		saveShipConfig: saveShipConfig,
		extraAccounts: extraAccounts,
		saveExtraAccount: saveExtraAccount,
		insertDoc: insertDoc,
		upsertNote: upsertNote,
		mutate: mutate,
		saveOverride: saveOverride,
		overrideAccount: overrideAccount,
		newId: newId,
		close: function () {
			if (!db) return
			database().close()
			db = null
		}
	}
}

module.exports = {
	createStore: createStore,
	SHIP_ID: SHIP_ID,
	TABLE_CODE: TABLE_CODE,
	statusOptions: statusOptions
}
