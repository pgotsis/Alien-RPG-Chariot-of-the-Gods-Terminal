import { pinHash } from "./sha256.js";

const CLEARANCE_ORDER = ["public", "crew", "research", "security", "command", "company"];

function expandClearance(ship, tags) {
	const inherits = ship.clearanceInherits || {};
	const out = new Set();
	function add(tag) {
		if (!tag || out.has(tag)) return;
		out.add(tag);
		(inherits[tag] || []).forEach(add);
	}
	(tags || []).forEach(add);
	return [...out];
}

function mergeGrants(ship, tags) {
	const modules = new Set();
	const mail = new Set();
	const notes = new Set();
	let schematic = "public";
	let rosterDetail = false;
	let bestSchematic = -1;
	const order = ship.schematicOrder || CLEARANCE_ORDER;

	tags.forEach(function (tag) {
		const grant = (ship.clearanceGrants || {})[tag];
		if (!grant) return;
		(grant.modules || []).forEach(function (id) { modules.add(id); });
		(grant.mail || []).forEach(function (id) { mail.add(id); });
		(grant.notes || []).forEach(function (id) { notes.add(id); });
		if (grant.rosterDetail) rosterDetail = true;
		if (grant.schematic) {
			const index = order.indexOf(grant.schematic);
			if (index >= bestSchematic) {
				bestSchematic = index;
				schematic = grant.schematic;
			}
		}
	});

	return {
		modules: [...modules],
		mail: [...mail],
		notes: [...notes],
		schematic: schematic,
		rosterDetail: rosterDetail
	};
}

function grantsFor(ship, account) {
	const tags = expandClearance(ship, account.clearance || []);
	const grants = mergeGrants(ship, tags);
	const limit = account.restrictTo;
	if (limit) {
		if (limit.modules) grants.modules = grants.modules.filter(function (id) { return limit.modules.indexOf(id) !== -1; });
		if (limit.mail) grants.mail = limit.mail.slice();
		if (limit.notes) grants.notes = limit.notes.slice();
		if (limit.schematic) grants.schematic = limit.schematic;
		if (limit.rosterDetail === false) grants.rosterDetail = false;
	}
	(account.extraMail || []).forEach(function (token) { grants.mail.push(token); });
	(account.extraNotes || []).forEach(function (token) { grants.notes.push(token); });
	grants.viewClearance = limit && limit.seeClearance ? limit.seeClearance.slice() : tags;
	return grants;
}

function resolveLayer(map, viewClearance) {
	if (!map) return "";
	if (typeof map === "string") return map;
	let best = null;
	let bestIndex = -1;
	Object.keys(map).forEach(function (key) {
		if (viewClearance.indexOf(key) === -1) return;
		const index = CLEARANCE_ORDER.indexOf(key);
		if (index >= bestIndex) {
			bestIndex = index;
			best = key;
		}
	});
	return best ? map[best] : "";
}

function schematicFor(layers, name, order) {
	const sequence = order || CLEARANCE_ORDER;
	const start = Math.max(sequence.indexOf(name), 0);
	for (let i = start; i >= 0; i--) {
		if (layers && layers[sequence[i]]) return layers[sequence[i]];
	}
	if (!layers) return "";
	return layers.public || "";
}

function roomAllowed(room, viewClearance) {
	const need = room.requires || [];
	if (!need.length) return true;
	return need.some(function (tag) { return viewClearance.indexOf(tag) !== -1; });
}

function accountById(ship, id) {
	return (ship.accounts || []).find(function (account) { return account.id === id; }) || null;
}

function mailArchives(ship, account, grants) {
	const ids = new Set();
	(grants.mail || []).forEach(function (token) {
		if (token === "self") ids.add(account.id);
		if (token.indexOf("account:") === 0) ids.add(token.slice("account:".length));
		if (token.indexOf("clearance:") === 0) {
			const tag = token.slice("clearance:".length);
			(ship.accounts || []).forEach(function (other) {
				if (other.external || other.id === "public") return;
				if ((other.clearance || []).indexOf(tag) !== -1) ids.add(other.id);
			});
		}
	});
	return [...ids].filter(function (id) {
		const other = accountById(ship, id);
		return other && other.id !== "public";
	});
}

function messagesFor(ship, archiveId, folder, viewer, grants) {
	return (ship.mail || []).filter(function (message) {
		if (folder === "inbox") {
			if (message.to === archiveId) return true;
			if (archiveId === viewer.id && message.to === "crew" && (grants.mail || []).indexOf("broadcast") !== -1) return true;
			return false;
		}
		if (folder === "outbox") return message.from === archiveId && !!message.to;
		if (folder === "drafts") return message.from === archiveId && !message.to;
		return false;
	});
}

function notesVisible(ship, account, grants) {
	const tokens = grants.notes || [];
	return (ship.notes || []).filter(function (note) {
		if (note.private) return note.owner === account.id;
		if (tokens.indexOf("self") !== -1 && note.owner === account.id) return true;
		if (tokens.indexOf("account:" + note.owner) !== -1) return true;
		const owner = accountById(ship, note.owner);
		if (!owner) return false;
		return tokens.some(function (token) {
			return token.indexOf("clearance:") === 0 && (owner.clearance || []).indexOf(token.slice("clearance:".length)) !== -1;
		});
	});
}

function entryVisible(entry, viewClearance) {
	const need = entry.clearance || ["crew"];
	return need.some(function (tag) { return viewClearance.indexOf(tag) !== -1; });
}

function accountForPin(ship, pin) {
	return (ship.accounts || []).find(function (account) {
		const hashed = pinHash(account.pinSalt || ship.salt, pin);
		if (account.pinHash && account.pinHash === hashed) return true;
		return (account.pinHashes || []).indexOf(hashed) !== -1;
	}) || null;
}

function accessLabel(account) {
	if (account.external) return "Visitor";
	const order = ["company", "command", "security", "research", "crew", "public"];
	for (let i = 0; i < order.length; i++) {
		if ((account.clearance || []).indexOf(order[i]) !== -1) return order[i];
	}
	return "crew";
}

export {
	expandClearance,
	grantsFor,
	resolveLayer,
	schematicFor,
	roomAllowed,
	accountById,
	mailArchives,
	messagesFor,
	notesVisible,
	entryVisible,
	accountForPin,
	accessLabel
};
