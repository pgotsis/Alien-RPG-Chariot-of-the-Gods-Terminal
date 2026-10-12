'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { createStore, SHIP_ID } = require('./store')

function fail(message, status) {
	const err = new Error(message)
	err.statusCode = status
	throw err
}

function createShips(options) {
	const shipsRoot = path.resolve(options.shipsRoot)
	const dataDir = path.resolve(options.dataDir)
	const store = createStore(dataDir)

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

	function databaseFile(shipId) {
		return path.join(dataDir, shipId, 'state.sqlite')
	}

	function state(shipId) {
		const ship = readShip(shipId)
		if (!ship && !fs.existsSync(databaseFile(shipId))) return null
		const db = store.database(shipId)
		if (ship) store.seed(db, ship)
		return store.read(db)
	}

	function patch(shipId, body) {
		const ship = readShip(shipId)
		const db = store.database(shipId)
		if (ship) store.seed(db, ship)
		return store.patch(db, body)
	}

	return {
		scenario: readShip,
		state: state,
		patch: patch,
		close: function () { store.close() }
	}
}

module.exports = { createShips: createShips }
