import { reactive } from "vue";
import { pinHash } from "./lib/sha256.js";
import {
	accountById,
	accountForPin,
	grantsFor
} from "./lib/access.js";
import { applySharedState } from "./lib/shared.js";
import { emptySession, loadSession, resetSession, saveSession } from "./lib/session.js";

function tableCode() {
	const value = new URLSearchParams(location.search).get("table") || "";
	return value.trim().toUpperCase();
}

export function createTerminal() {
	const state = reactive({
		ship: null,
		session: emptySession(),
		account: null,
		grants: null,
		mode: "loading",
		module: "home",
		pendingId: null,
		unlisted: false,
		pin: "",
		loginError: "",
		archiveId: null,
		folder: "inbox",
		openMailId: null,
		deckId: null,
		roomId: null,
		showOverview: false,
		openNoteId: null,
		openFileId: null,
		openTaskId: null,
		fileCode: "",
		fileError: "",
		revision: null,
		tableCode: "",
		ships: [],
		homeShip: "",
		pulses: [],
		packet: null,
		overrideCode: "",
		overrideError: ""
	});

	let pulling = false;
	let timer = 0;

	function play(name) {
		const audio = new Audio("sounds/" + name);
		audio.play().catch(function () {});
	}

	function sessionId() {
		if (!state.tableCode || !state.ship || !state.ship.id) return "";
		return state.tableCode + ":" + state.ship.id;
	}

	function save() {
		const id = sessionId();
		if (id) saveSession(id, state.session);
	}

	function loadHere() {
		const current = loadSession(sessionId());
		if (current.accountId || current.overrideToken || current.seenPulses.length) return current;
		if (state.ship && state.ship.id === state.homeShip) {
			const legacy = loadSession(state.tableCode);
			if (legacy.accountId || legacy.overrideToken) return legacy;
		}
		return current;
	}

	function pulseHere(pulse) {
		if (!state.ship) return false;
		if (pulse.shipId && pulse.shipId !== state.ship.id) return false;
		return true;
	}

	function ack(moduleId) {
		let changed = false;
		(state.pulses || []).forEach(function (pulse) {
			if (!pulseHere(pulse) || pulse.module !== moduleId) return;
			if (state.session.seenPulses.indexOf(pulse.id) !== -1) return;
			state.session.seenPulses.push(pulse.id);
			changed = true;
		});
		if (changed) save();
	}

	function unseen(moduleId) {
		return (state.pulses || []).some(function (pulse) {
			return pulseHere(pulse) && pulse.module === moduleId && state.session.seenPulses.indexOf(pulse.id) === -1;
		});
	}

	function setAccount(account) {
		state.session.accountId = account.id;
		state.account = account;
		state.grants = grantsFor(state.ship, account);
		state.module = "home";
		state.archiveId = account.id;
		state.folder = "inbox";
		state.openMailId = null;
		state.pin = "";
		state.loginError = "";
		state.mode = "app";
		const decks = state.ship.decks || [];
		state.deckId = decks.length ? decks[0].id : null;
		state.roomId = null;
		state.showOverview = false;
		save();
	}

	function selectCrew(account) {
		play("keyok1.mp3");
		state.pendingId = account.id;
		state.unlisted = false;
		state.pin = "";
		state.loginError = "";
		state.mode = "pin";
	}

	function otherCredentials() {
		play("keyok2.mp3");
		state.pendingId = null;
		state.unlisted = true;
		state.pin = "";
		state.loginError = "";
		state.mode = "pin";
	}

	function publicAccess() {
		const account = accountById(state.ship, "public");
		if (!account) return;
		play("accessgranted.mp3");
		setAccount(account);
	}

	function pushPin(digit) {
		if (state.pin.length >= 12) return;
		play("keyok3.mp3");
		state.pin += digit;
	}

	function clearPin() {
		state.pin = "";
	}

	function submitPin() {
		const pending = state.unlisted ? null : accountById(state.ship, state.pendingId);
		if (pending && !pending.pinHash) {
			state.loginError = "No access card on file";
			play("accessdenied.mp3");
			return;
		}
		if (!state.pin) return;
		if (state.unlisted) {
			const found = accountForPin(state.ship, state.pin);
			if (!found) {
				state.loginError = "Access denied";
				state.pin = "";
				play("accessdenied.mp3");
				return;
			}
			play("accessgranted.mp3");
			setAccount(found);
			return;
		}
		if (pinHash(pending.pinSalt || state.ship.salt, state.pin) !== pending.pinHash) {
			state.loginError = "Access denied";
			state.pin = "";
			play("accessdenied.mp3");
			return;
		}
		play("accessgranted.mp3");
		setAccount(pending);
	}

	function backToLogin() {
		state.mode = "login";
		state.pin = "";
		state.loginError = "";
	}

	function resetStation() {
		if (!state.tableCode) return;
		if (!window.confirm("Clear this station's login, unlocks, and notes?")) return;
		resetSession(sessionId());
		state.session = emptySession();
		state.account = null;
		state.grants = null;
		state.packet = null;
		state.mode = "login";
		state.loginError = "";
	}

	function logout() {
		state.session.accountId = null;
		state.session.overrideToken = null;
		state.packet = null;
		save();
		state.account = null;
		state.grants = null;
		state.mode = "login";
	}

	function openModule(id) {
		play("sound1.wav");
		state.module = id;
		ack(id);
	}

	function home() {
		state.module = "home";
		ack("announcements");
	}

	function unlockEntry(entry) {
		if (pinHash(state.ship.salt, state.fileCode) !== entry.codeHash) {
			state.fileError = "Code rejected";
			state.fileCode = "";
			play("accessdenied.mp3");
			return;
		}
		if (state.session.unlocked.indexOf(entry.id) === -1) state.session.unlocked.push(entry.id);
		state.fileCode = "";
		state.fileError = "";
		save();
		play("accessgranted.mp3");
	}

	function onKeydown(event) {
		if (state.mode !== "pin") return;
		if (event.key >= "0" && event.key <= "9") {
			pushPin(event.key);
			event.preventDefault();
		} else if (/^[a-zA-Z]$/.test(event.key)) {
			pushPin(event.key.toUpperCase());
			event.preventDefault();
		} else if (event.key === "Backspace") {
			state.pin = state.pin.slice(0, -1);
			event.preventDefault();
		} else if (event.key === "Enter") {
			submitPin();
			event.preventDefault();
		} else if (event.key === "Escape") {
			backToLogin();
		}
	}

	async function pullShared() {
		if (!state.tableCode || pulling) return;
		if (!state.ship || state.mode === "error") {
			pulling = true;
			try {
				await enterOpenComputer();
			} finally {
				pulling = false;
			}
			return;
		}
		pulling = true;
		let closedUnderfoot = false;
		try {
			const headers = {};
			if (state.session.overrideToken) headers["X-Override-Token"] = state.session.overrideToken;
			const shipQuery = state.ship && state.ship.id ? "?ship=" + encodeURIComponent(state.ship.id) : "";
			const response = await fetch("api/tables/" + encodeURIComponent(state.tableCode) + "/state" + shipQuery, {
				cache: "no-store",
				headers: headers
			});
			if (response.status === 403) {
				closedUnderfoot = true;
			} else if (response.ok) {
				const shared = await response.json();
				if (!(shared.shipId && state.ship && shared.shipId !== state.ship.id)) {
					if (Array.isArray(shared.ships)) state.ships = shared.ships;
					if (shared.homeShip) state.homeShip = shared.homeShip;
					const same = shared.revision === state.revision;
					state.revision = shared.revision;
					state.pulses = shared.pulses || [];
					if (!same) applySharedState(state.ship, shared);
					if (state.session.overrideToken && shared.packet) state.packet = shared.packet;
				}
			}
		} finally {
			pulling = false;
		}
		if (closedUnderfoot) await enterOpenComputer();
	}

	async function applyComputer(data) {
		state.ship = data.ship;
		state.ships = data.ships || [];
		state.homeShip = data.homeShip || state.homeShip;
		state.revision = data.revision;
		state.pulses = data.pulses || [];
		state.packet = null;
		state.module = "home";
		state.pin = "";
		state.loginError = "";
		document.title = (state.ship.computer || "MU/TH/UR") + " — " + (state.ship.name || "Terminal");
		const url = new URL(location.href);
		url.searchParams.set("table", state.tableCode);
		url.searchParams.set("ship", state.ship.id);
		history.replaceState(null, "", url);
		state.session = loadHere();
		if (state.session.overrideToken) await pullShared();
		if (state.session.accountId && accountById(state.ship, state.session.accountId)) {
			setAccount(accountById(state.ship, state.session.accountId));
		} else {
			state.account = null;
			state.grants = null;
			state.mode = "login";
		}
	}

	async function enterOpenComputer() {
		const response = await fetch("api/tables/" + encodeURIComponent(state.tableCode), { cache: "no-store" });
		if (response.status === 403) {
			state.ship = null;
			state.ships = [];
			state.account = null;
			state.grants = null;
			state.mode = "error";
			state.loginError = "This computer is closed.";
			document.title = "MU/TH/UR";
			const url = new URL(location.href);
			url.searchParams.delete("ship");
			history.replaceState(null, "", url);
			return;
		}
		if (!response.ok) return;
		const data = await response.json();
		if (!data.ship) return;
		if (state.ship && state.ship.id === data.ship.id && state.mode !== "error") return;
		save();
		await applyComputer(data);
	}

	async function sendMail(to, subject, body) {
		const response = await fetch("api/tables/" + encodeURIComponent(state.tableCode) + "/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				from: state.account.id,
				to: to,
				subject: subject,
				body: body,
				shipId: state.ship.id
			})
		});
		if (!response.ok) {
			play("accessdenied.mp3");
			return false;
		}
		await pullShared();
		ack("mail");
		play("keyok1.mp3");
		return true;
	}

	let noteTimer = 0;
	function saveStationNote(body) {
		window.clearTimeout(noteTimer);
		noteTimer = window.setTimeout(async function () {
			if (!state.tableCode || !state.account) return;
			await fetch("api/tables/" + encodeURIComponent(state.tableCode) + "/notes", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ accountId: state.account.id, body: body, shipId: state.ship.id })
			});
			await pullShared();
			ack("notes");
		}, 400);
	}

	async function submitOverride() {
		state.overrideError = "";
		const response = await fetch("api/tables/" + encodeURIComponent(state.tableCode) + "/override", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ accountId: state.account.id, code: state.overrideCode, shipId: state.ship.id })
		});
		if (!response.ok) {
			state.overrideError = "Override rejected";
			state.overrideCode = "";
			play("accessdenied.mp3");
			return;
		}
		const data = await response.json();
		state.session.overrideToken = data.token;
		state.packet = data.packet;
		state.overrideCode = "";
		save();
		play("accessgranted.mp3");
		openModule("packet");
	}

	async function boot() {
		if (location.protocol === "file:") {
			state.mode = "error";
			state.loginError = "Open this terminal through a web server.";
			return;
		}
		const params = new URLSearchParams(location.search);
		if (params.has("gm")) {
			state.mode = "gm";
			document.title = "GM desk";
			return;
		}
		const code = tableCode();
		if (!code) {
			state.mode = "standby";
			document.title = "MU/TH/UR 2000";
			return;
		}
		const requested = params.get("ship");
		try {
			let response = await fetch(
				"api/tables/" + encodeURIComponent(code) + (requested ? "?ship=" + encodeURIComponent(requested) : ""),
				{ cache: "no-store" }
			);
			if (response.status === 403) {
				response = await fetch("api/tables/" + encodeURIComponent(code), { cache: "no-store" });
			}
			if (response.status === 403) {
				state.tableCode = code;
				state.mode = "error";
				state.loginError = "This computer is closed.";
				return;
			}
			if (!response.ok) throw new Error("missing");
			const data = await response.json();
			state.tableCode = data.code;
			state.ship = data.ship;
			state.ships = data.ships || [];
			state.homeShip = data.homeShip || (data.ship && data.ship.id) || "";
			state.revision = data.revision;
			state.pulses = data.pulses || [];
		} catch (err) {
			state.mode = "error";
			state.loginError = "This table is not on file.";
			return;
		}
		document.title = (state.ship.computer || "MU/TH/UR") + " — " + (state.ship.name || "Terminal");
		if (requested && requested !== state.ship.id) {
			const url = new URL(location.href);
			url.searchParams.set("ship", state.ship.id);
			history.replaceState(null, "", url);
		}
		state.session = loadHere();
		if (state.session.overrideToken) await pullShared();
		const card = params.get("code");
		if (card) {
			const account = accountForPin(state.ship, card);
			if (account) setAccount(account);
			else {
				state.loginError = "Access denied";
				state.mode = "login";
			}
		} else if (state.session.accountId && accountById(state.ship, state.session.accountId)) {
			setAccount(accountById(state.ship, state.session.accountId));
		} else {
			state.mode = "login";
		}
	}

	async function connectShip(shipId) {
		if (!state.tableCode || !shipId) return;
		if (state.ship && state.ship.id === shipId && state.mode !== "error") return;
		save();
		const response = await fetch(
			"api/tables/" + encodeURIComponent(state.tableCode) + "?ship=" + encodeURIComponent(shipId),
			{ cache: "no-store" }
		);
		if (!response.ok) {
			if (response.status === 403) play("accessdenied.mp3");
			return;
		}
		await applyComputer(await response.json());
	}

	async function transferPersonal(toShipId) {
		const other = (state.ships || []).find(function (ship) { return ship.id === toShipId; });
		if (!other || !state.account || state.account.id === "public" || !state.ship) return;
		const sure = window.confirm(
			"Move your personal mail and station notes to " + other.name + "? Schematics, logs, and ship status stay on this computer."
		);
		if (!sure) return;
		const response = await fetch("api/tables/" + encodeURIComponent(state.tableCode) + "/transfer", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				accountId: state.account.id,
				fromShip: state.ship.id,
				toShip: toShipId
			})
		});
		if (!response.ok) {
			play("accessdenied.mp3");
			return;
		}
		await pullShared();
		play("keyok1.mp3");
	}

	function start() {
		boot();
		timer = window.setInterval(pullShared, 5000);
		window.addEventListener("keydown", onKeydown);
	}

	function stop() {
		window.clearInterval(timer);
		window.removeEventListener("keydown", onKeydown);
	}

	return {
		state,
		play,
		save,
		selectCrew,
		otherCredentials,
		publicAccess,
		pushPin,
		clearPin,
		submitPin,
		backToLogin,
		resetStation,
		logout,
		openModule,
		home,
		unlockEntry,
		unseen,
		sendMail,
		saveStationNote,
		submitOverride,
		connectShip,
		transferPersonal,
		start,
		stop
	};
}
