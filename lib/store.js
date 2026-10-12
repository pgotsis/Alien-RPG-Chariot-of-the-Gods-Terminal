'use strict'

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
const MAX_TEXT = 4000
const MAX_ROWS = 500

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

function openDatabase(file) {
	const db = new DatabaseSync(file)
	db.exec(`
		PRAGMA journal_mode = WAL;
		PRAGMA busy_timeout = 5000;
		CREATE TABLE IF NOT EXISTS meta (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS roster (
			account_id TEXT PRIMARY KEY,
			status TEXT,
			last_login TEXT,
			classified_status TEXT
		);
		CREATE TABLE IF NOT EXISTS systems (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			state TEXT NOT NULL,
			detail TEXT NOT NULL,
			position INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS announcements (
			id TEXT PRIMARY KEY,
			document TEXT NOT NULL,
			position INTEGER NOT NULL
		);
		CREATE TABLE IF NOT EXISTS logs (
			id TEXT PRIMARY KEY,
			document TEXT NOT NULL,
			position INTEGER NOT NULL
		);
	`)
	return db
}

function createStore(dataDir) {
	const root = path.resolve(dataDir)
	fs.mkdirSync(root, { recursive: true })
	const open = new Map()

	function database(shipId) {
		assertId(shipId, 'ship id')
		const existing = open.get(shipId)
		if (existing) return existing
		const dir = path.resolve(root, shipId)
		if (!dir.startsWith(root + path.sep)) fail('Invalid ship id')
		fs.mkdirSync(dir, { recursive: true })
		const db = openDatabase(path.join(dir, 'state.sqlite'))
		open.set(shipId, db)
		return db
	}

	function meta(db, key) {
		const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(key)
		return row ? row.value : null
	}

	function setMeta(db, key, value) {
		db.prepare(`
			INSERT INTO meta (key, value) VALUES (?, ?)
			ON CONFLICT(key) DO UPDATE SET value = excluded.value
		`).run(key, value)
	}

	function seeded(db) {
		return meta(db, 'seeded') === '1'
	}

	function revisionOf(db) {
		const value = meta(db, 'revision')
		return value == null ? 0 : Number(value)
	}

	function seed(db, ship) {
		if (seeded(db)) return
		const accounts = Array.isArray(ship.accounts) ? ship.accounts : []
		const systems = Array.isArray(ship.systems) ? ship.systems : []
		const announcements = Array.isArray(ship.announcements) ? ship.announcements : []
		const logs = Array.isArray(ship.logs) ? ship.logs : []
		db.exec('BEGIN IMMEDIATE')
		try {
			const roster = db.prepare('INSERT INTO roster (account_id, status, last_login, classified_status) VALUES (?, ?, ?, ?)')
			const seen = new Set()
			for (const account of accounts) {
				if (!account || typeof account.id !== 'string' || !SHIP_ID.test(account.id) || seen.has(account.id)) continue
				seen.add(account.id)
				roster.run(
					account.id,
					account.status == null ? null : String(account.status).slice(0, MAX_TEXT),
					account.lastLogin == null ? null : String(account.lastLogin).slice(0, MAX_TEXT),
					account.classifiedStatus == null ? null : String(account.classifiedStatus).slice(0, MAX_TEXT)
				)
			}
			const system = db.prepare('INSERT INTO systems (id, name, state, detail, position) VALUES (?, ?, ?, ?, ?)')
			systems.forEach(function (item, index) {
				if (!item || typeof item.id !== 'string' || !SHIP_ID.test(item.id)) return
				system.run(
					item.id,
					String(item.name || item.id).slice(0, MAX_TEXT),
					String(item.state || '').slice(0, MAX_TEXT),
					JSON.stringify(item.detail || {}),
					index
				)
			})
			const announcement = db.prepare('INSERT INTO announcements (id, document, position) VALUES (?, ?, ?)')
			announcements.forEach(function (item, index) {
				if (!item || typeof item.id !== 'string' || !SHIP_ID.test(item.id)) return
				announcement.run(item.id, JSON.stringify(item), index)
			})
			const log = db.prepare('INSERT INTO logs (id, document, position) VALUES (?, ?, ?)')
			logs.forEach(function (item, index) {
				if (!item || typeof item.id !== 'string' || !SHIP_ID.test(item.id)) return
				log.run(item.id, JSON.stringify(item), index)
			})
			setMeta(db, 'seeded', '1')
			setMeta(db, 'revision', '1')
			db.exec('COMMIT')
		} catch (err) {
			db.exec('ROLLBACK')
			throw err
		}
	}

	function read(db) {
		const roster = {}
		for (const row of db.prepare('SELECT account_id, status, last_login, classified_status FROM roster').all()) {
			roster[row.account_id] = {
				status: row.status,
				lastLogin: row.last_login,
				classifiedStatus: row.classified_status
			}
		}
		return {
			seeded: seeded(db),
			revision: revisionOf(db),
			roster: roster,
			systems: db.prepare('SELECT id, name, state, detail FROM systems ORDER BY position, id').all().map(function (row) {
				return { id: row.id, name: row.name, state: row.state, detail: JSON.parse(row.detail) }
			}),
			announcements: db.prepare('SELECT document FROM announcements ORDER BY position, id').all().map(function (row) {
				return JSON.parse(row.document)
			}),
			logs: db.prepare('SELECT document FROM logs ORDER BY position, id').all().map(function (row) {
				return JSON.parse(row.document)
			})
		}
	}

	function replaceDocs(db, table, items) {
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
		db.prepare('DELETE FROM ' + table).run()
		const insert = db.prepare('INSERT INTO ' + table + ' (id, document, position) VALUES (?, ?, ?)')
		items.forEach(function (item, index) {
			insert.run(item.id, JSON.stringify(item), index)
		})
	}

	function patchRoster(db, roster) {
		if (!roster || typeof roster !== 'object' || Array.isArray(roster)) fail('roster must be an object')
		const upsert = db.prepare(`
			INSERT INTO roster (account_id, status, last_login, classified_status)
			VALUES (@id, @status, @lastLogin, @classifiedStatus)
			ON CONFLICT(account_id) DO UPDATE SET
				status = COALESCE(@status, roster.status),
				last_login = COALESCE(@lastLogin, roster.last_login),
				classified_status = COALESCE(@classifiedStatus, roster.classified_status)
		`)
		for (const [id, fields] of Object.entries(roster)) {
			assertId(id, 'account id')
			if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fail('Invalid roster entry')
			upsert.run({
				id: id,
				status: text(fields.status, 'status'),
				lastLogin: text(fields.lastLogin, 'lastLogin'),
				classifiedStatus: text(fields.classifiedStatus, 'classifiedStatus')
			})
		}
	}

	function patchSystems(db, systems) {
		if (!systems || typeof systems !== 'object' || Array.isArray(systems)) fail('systems must be an object')
		const update = db.prepare(`
			UPDATE systems
			SET name = COALESCE(?, name), state = COALESCE(?, state), detail = COALESCE(?, detail)
			WHERE id = ?
		`)
		const insert = db.prepare(`
			INSERT INTO systems (id, name, state, detail, position)
			VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(position), -1) + 1 FROM systems))
		`)
		for (const [id, fields] of Object.entries(systems)) {
			assertId(id, 'system id')
			if (!fields || typeof fields !== 'object' || Array.isArray(fields)) fail('Invalid system entry')
			const name = text(fields.name, 'name')
			const state = text(fields.state, 'state')
			let detail = null
			if (fields.detail != null) {
				if (typeof fields.detail !== 'object' || Array.isArray(fields.detail)) fail('detail must be an object')
				detail = JSON.stringify(fields.detail)
				if (detail.length > 20000) fail('detail is too large')
			}
			const existing = db.prepare('SELECT id FROM systems WHERE id = ?').get(id)
			if (existing) update.run(name, state, detail, id)
			else insert.run(id, name || id, state || '', detail || '{}')
		}
	}

	function patch(db, body) {
		if (!body || typeof body !== 'object' || Array.isArray(body)) fail('JSON object required')
		const allowed = new Set(['roster', 'systems', 'announcements', 'logs'])
		for (const key of Object.keys(body)) {
			if (!allowed.has(key)) fail('Unknown field ' + key)
		}
		db.exec('BEGIN IMMEDIATE')
		try {
			if (!seeded(db)) {
				setMeta(db, 'seeded', '1')
				setMeta(db, 'revision', '0')
			}
			if (body.roster) patchRoster(db, body.roster)
			if (body.systems) patchSystems(db, body.systems)
			if (body.announcements) replaceDocs(db, 'announcements', body.announcements)
			if (body.logs) replaceDocs(db, 'logs', body.logs)
			const next = revisionOf(db) + 1
			setMeta(db, 'revision', String(next))
			db.exec('COMMIT')
		} catch (err) {
			db.exec('ROLLBACK')
			throw err
		}
		return read(db)
	}

	return {
		database: database,
		seed: seed,
		read: read,
		patch: patch,
		close: function () {
			for (const db of open.values()) db.close()
			open.clear()
		}
	}
}

module.exports = {
	createStore: createStore,
	SHIP_ID: SHIP_ID
}
