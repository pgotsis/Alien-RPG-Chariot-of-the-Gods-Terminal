import { reactive } from "vue";
import { pinHash } from "./lib/sha256.js";
import {
	accountById,
	accountForPin,
	grantsFor
} from "./lib/access.js";
import { applySharedState, loadSharedState } from "./lib/shared.js";
import { emptySession, loadSession, resetSession, saveSession } from "./lib/session.js";

function scenarioRequest() {
	const params = new URLSearchParams(location.search);
	const data = params.get("data");
	if (data) return data;
	const ship = params.get("ship") || "cronus";
	return "api/ships/" + encodeURIComponent(ship);
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
		revision: null
	});

	let pulling = false;
	let timer = 0;

	function play(name) {
		const audio = new Audio("sounds/" + name);
		audio.play().catch(function () {});
	}

	function save() {
		if (state.ship) saveSession(state.ship.id, state.session);
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
		if (pinHash(state.ship.salt, state.pin) !== pending.pinHash) {
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
		if (!state.ship) return;
		if (!window.confirm("Clear this station's login, unlocks, and notes?")) return;
		resetSession(state.ship.id);
		state.session = emptySession();
		state.account = null;
		state.grants = null;
		state.mode = "login";
		state.loginError = "";
	}

	function logout() {
		state.session.accountId = null;
		save();
		state.account = null;
		state.grants = null;
		state.mode = "login";
	}

	function openModule(id) {
		play("sound1.wav");
		state.module = id;
	}

	function home() {
		state.module = "home";
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
		if (!state.ship || pulling) return;
		pulling = true;
		try {
			const shared = await loadSharedState(state.ship.id);
			if (!shared || shared.revision === state.revision) return;
			state.revision = shared.revision;
			applySharedState(state.ship, shared);
		} finally {
			pulling = false;
		}
	}

	async function boot() {
		if (location.protocol === "file:") {
			state.mode = "error";
			state.loginError = "Open this terminal through a web server so it can load the ship file.";
			return;
		}
		let request;
		try {
			request = new URL(scenarioRequest(), location.href);
		} catch (err) {
			state.mode = "error";
			state.loginError = "The ship file address is not valid.";
			return;
		}
		if (request.protocol !== "http:" && request.protocol !== "https:") {
			state.mode = "error";
			state.loginError = "The ship file must be an http or https address.";
			return;
		}
		try {
			const response = await fetch(request.href, { cache: "no-store" });
			if (!response.ok) throw new Error("missing");
			state.ship = await response.json();
			await pullShared();
		} catch (err) {
			state.mode = "error";
			state.loginError = "Ship file could not be loaded.";
			return;
		}
		document.title = (state.ship.computer || "MU/TH/UR") + " — " + (state.ship.name || "Terminal");
		state.session = loadSession(state.ship.id);
		const code = new URLSearchParams(location.search).get("code");
		if (code) {
			const account = accountForPin(state.ship, code);
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

	function start() {
		boot();
		timer = window.setInterval(pullShared, 15000);
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
		start,
		stop
	};
}
