'use strict'

const crypto = require('node:crypto')
const fs = require('node:fs')
const path = require('node:path')
const fastify = require('fastify')
const fastifyStatic = require('@fastify/static')
const pino = require('pino')
const { createShips } = require('./lib/ships')

const logger = pino({
	serializers: { req: serializeReq }
}, pino.destination({ dest: 1, sync: true }))

function fatal(message) {
	logger.fatal(message)
	process.exit(1)
}

function readPort() {
	const raw = process.env.PORT
	if (raw == null || String(raw).trim() === '') fatal('PORT is required')
	if (!/^[0-9]+$/.test(String(raw))) fatal('PORT must be an integer')
	const port = Number(raw)
	if (port < 1 || port > 65535) fatal('PORT must be between 1 and 65535')
	return port
}

function readBasePath() {
	const raw = process.env.BASE_PATH
	if (raw == null || raw === '' || raw === '/') return '/'
	if (!raw.startsWith('/') || !raw.endsWith('/')) {
		fatal('BASE_PATH must start and end with /')
	}
	if (raw.includes('//') || raw.includes('..') || raw.includes('\\') || /[\s?#]/.test(raw)) {
		fatal('BASE_PATH must be a slash-delimited path prefix')
	}
	const body = raw.slice(1, -1)
	if (!/^[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*$/.test(body)) {
		fatal('BASE_PATH contains unsupported characters')
	}
	return raw
}

function readDataDir() {
	const raw = process.env.DATA_DIR
	if (raw == null || String(raw).trim() === '') fatal('DATA_DIR is required')
	return path.resolve(String(raw).trim())
}

function readGmToken() {
	const raw = process.env.GM_TOKEN
	if (raw == null) return ''
	return String(raw).trim()
}

function authorized(header, token) {
	const got = Buffer.from(String(header || ''))
	const expected = Buffer.from('Bearer ' + token)
	if (got.length !== expected.length) return false
	return crypto.timingSafeEqual(got, expected)
}

function requireNode24() {
	const major = Number(process.versions.node.split('.')[0])
	if (major !== 24) fatal('Node.js 24 is required, found ' + process.versions.node)
}

function headerFirst(value) {
	if (Array.isArray(value)) return value[0] || ''
	return value || ''
}

function publicOrigin(request) {
	const forwardedHost = headerFirst(request.headers['x-forwarded-host']).split(',')[0].trim()
	const host = forwardedHost || headerFirst(request.headers.host).split(',')[0].trim()
	const forwardedProto = headerFirst(request.headers['x-forwarded-proto']).split(',')[0].trim()
	const proto = forwardedProto === 'https' || forwardedProto === 'http'
		? forwardedProto
		: (request.protocol === 'https' ? 'https' : 'http')
	if (!/^[A-Za-z0-9.\-:[\]]+$/.test(host)) return ''
	return proto + '://' + host
}

function redactUrl(url) {
	return String(url || '').replace(/([?&]code=)[^&]*/gi, '$1redacted')
}

function serializeReq(request) {
	return {
		method: request.method,
		url: redactUrl(request.url),
		hostname: request.hostname,
		remoteAddress: request.ip
	}
}

async function main() {
	requireNode24()
	const port = readPort()
	const basePath = readBasePath()
	const dataDir = readDataDir()
	const gmToken = readGmToken()
	const barePrefix = basePath === '/' ? '' : basePath.slice(0, -1)
	const ships = createShips({
		shipsRoot: path.join(__dirname, 'data'),
		dataDir: dataDir
	})

	const app = fastify({
		loggerInstance: logger,
		trustProxy: true,
		routerOptions: { ignoreTrailingSlash: false },
		requestIdHeader: false
	})

	app.setErrorHandler(function (err, request, reply) {
		const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500
		if (status >= 500) request.log.error(err)
		return reply.code(status).type('application/json; charset=utf-8').send({
			error: status >= 500 ? 'Internal error' : err.message
		})
	})

	app.get(basePath + 'health', async function (_request, reply) {
		return reply.code(200).type('application/json; charset=utf-8').send({ ok: true })
	})

	app.get(basePath + 'api/ships/:shipId/state', async function (request, reply) {
		const state = ships.state(request.params.shipId)
		if (!state) return reply.code(404).send({ error: 'Ship not found' })
		return reply.send(state)
	})

	app.patch(basePath + 'api/ships/:shipId/state', async function (request, reply) {
		if (!gmToken || !authorized(request.headers.authorization, gmToken)) {
			return reply.code(401).send({ error: 'Unauthorized' })
		}
		return reply.send(ships.patch(request.params.shipId, request.body))
	})

	app.get(basePath + 'api/ships/:shipId', async function (request, reply) {
		const ship = ships.scenario(request.params.shipId)
		if (!ship) return reply.code(404).send({ error: 'Ship not found' })
		return reply.send(ship)
	})

	if (barePrefix) {
		app.get(barePrefix, async function (request, reply) {
			const query = request.raw.url.includes('?')
				? request.raw.url.slice(request.raw.url.indexOf('?'))
				: ''
			const origin = publicOrigin(request)
			const target = (origin || '') + basePath + query
			return reply.redirect(target, 308)
		})
	}

	const webRoot = path.join(__dirname, 'dist')
	if (!fs.existsSync(path.join(webRoot, 'index.html'))) {
		fatal('frontend build is missing; run npm run build')
	}

	await app.register(fastifyStatic, {
		root: webRoot,
		prefix: basePath,
		index: ['index.html'],
		dotfiles: 'deny',
		list: false,
		decorateReply: false
	})

	let closing = false
	async function shutdown(signal) {
		if (closing) return
		closing = true
		app.log.info({ signal }, 'shutting down')
		try {
			ships.close()
			await app.close()
			process.exit(0)
		} catch (err) {
			app.log.fatal(err)
			process.exit(1)
		}
	}
	process.once('SIGTERM', function () { shutdown('SIGTERM') })
	process.once('SIGINT', function () { shutdown('SIGINT') })

	await app.listen({ host: '127.0.0.1', port: port })
	app.log.info({ basePath: basePath, dataDir: dataDir, writes: Boolean(gmToken) }, 'terminal ready')
}

main().catch(function (err) {
	logger.fatal(err)
	process.exit(1)
})
