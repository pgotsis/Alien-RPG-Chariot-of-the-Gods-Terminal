<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const token = ref(sessionStorage.getItem("muthr-gm-token") || "");
const error = ref("");
const starts = ref([]);
const tables = ref([]);
const detail = ref(null);
const page = ref("list");
const catalog = ref([]);
const createPreset = ref("");
const createShips = ref([]);
const createHome = ref("");
const creating = ref(false);
const shipId = ref("");
const logText = ref("");
const logClearance = ref("crew");
const replyTo = ref("");
const replyFrom = ref("");
const replySubject = ref("");
const replyBody = ref("");
const newName = ref("");
const newOptions = ref("Offline;Standby;Online");
const moveAccount = ref("");
const moveTo = ref("");
const loadedComment = ref("");
let timer = 0;

function headers(json = false) {
	return {
		Authorization: "Bearer " + token.value.trim(),
		...(json ? { "Content-Type": "application/json" } : {})
	};
}

function when(value) {
	if (!value) return "—";
	const parsed = Date.parse(value);
	if (Number.isNaN(parsed)) return value;
	return new Date(parsed).toLocaleString();
}

function addedText(added) {
	const row = added || {};
	return [
		(row.playerMail || 0) + " player mail",
		(row.gmMail || 0) + " GM mail",
		(row.playerNotes || 0) + " player notes",
		(row.gmNotes || 0) + " GM notes",
		(row.gmLogs || 0) + " GM logs"
	].join(", ");
}

function playerUrl(code, ship) {
	const url = new URL(location.href);
	url.search = "?table=" + code + (ship ? "&ship=" + ship : "");
	url.hash = "";
	return url.href;
}

async function loadLists() {
	error.value = "";
	const [scenarioResponse, tableResponse] = await Promise.all([
		fetch("api/gm/scenarios", { headers: headers(), cache: "no-store" }),
		fetch("api/gm/tables", { headers: headers(), cache: "no-store" })
	]);
	if (scenarioResponse.status === 401 || tableResponse.status === 401) {
		error.value = "GM token rejected. Set GM_TOKEN on the server, then enter it here.";
		starts.value = [];
		tables.value = [];
		return;
	}
	if (!scenarioResponse.ok || !tableResponse.ok) {
		error.value = "The GM desk could not be loaded.";
		return;
	}
	const scenarios = await scenarioResponse.json();
	starts.value = scenarios.starts || [];
	catalog.value = scenarios.ships || [];
	tables.value = await tableResponse.json();
}

function saveToken() {
	sessionStorage.setItem("muthr-gm-token", token.value.trim());
	loadLists().catch(function () { error.value = "The GM desk could not be loaded."; });
}

function backToTables() {
	page.value = "list";
	detail.value = null;
	error.value = "";
	loadLists().catch(function () { error.value = "The GM desk could not be loaded."; });
}

function chooseScenario(id) {
	createPreset.value = id || "";
	const scenario = starts.value.find((item) => item.id === id);
	createShips.value = scenario ? scenario.ships.slice() : [];
	createHome.value = scenario ? scenario.home : "";
}

function showCreate() {
	detail.value = null;
	error.value = "";
	chooseScenario(starts.value[0] && starts.value[0].id);
	page.value = "create";
}

function configureShip(id, on) {
	createShips.value = on ? [...new Set(createShips.value.concat(id))] : createShips.value.filter((ship) => ship !== id);
	if (!createShips.value.includes(createHome.value)) createHome.value = createShips.value[0] || "";
}

async function createTable() {
	if (creating.value || !createShips.value.length) return;
	creating.value = true;
	error.value = "";
	try {
		const response = await fetch("api/gm/tables", {
			method: "POST",
			headers: headers(true),
			body: JSON.stringify({ ships: createShips.value, home: createHome.value })
		});
		if (!response.ok) { error.value = "The table could not be created."; return; }
		const created = await response.json();
		await openTable(created.code);
	} catch { error.value = "The table could not be created."; }
	finally { creating.value = false; }
}

function syncShip() {
	const ships = (detail.value && detail.value.ships) || [];
	if (!shipId.value || !ships.some((ship) => ship.id === shipId.value)) {
		shipId.value = detail.value && detail.value.homeShip ? detail.value.homeShip : (ships[0] ? ships[0].id : "");
	}
	const ship = ships.find((item) => item.id === shipId.value);
	if (ship && ship.contacts && ship.contacts.length && !ship.contacts.some((contact) => contact.id === replyFrom.value)) {
		replyFrom.value = ship.contacts[0].id;
	}
}

async function openTable(code) {
	const response = await fetch("api/gm/tables/" + encodeURIComponent(code), {
		headers: headers(),
		cache: "no-store"
	});
	if (!response.ok) {
		error.value = "That table could not be opened.";
		return;
	}
	detail.value = await response.json();
	page.value = "detail";
	loadedComment.value = detail.value.comment || "";
	syncShip();
	await loadLists();
}

async function refreshDetail() {
	if (!detail.value) return;
	const code = detail.value.code;
	const response = await fetch("api/gm/tables/" + encodeURIComponent(code), {
		headers: headers(),
		cache: "no-store"
	});
	if (!response.ok) return;
	const next = await response.json();
	if (!detail.value || detail.value.code !== next.code) return;
	detail.value.messages = next.messages;
	detail.value.revision = next.revision;
	detail.value.added = next.added;
	detail.value.playerSeenAt = next.playerSeenAt;
	detail.value.gmSeenAt = next.gmSeenAt;
	const focused = document.activeElement && document.activeElement.dataset.field === "comment";
	if (!focused && detail.value.comment === loadedComment.value) {
		detail.value.comment = next.comment;
		loadedComment.value = next.comment;
	}
}

async function patch(body) {
	error.value = "";
	const response = await fetch("api/gm/tables/" + encodeURIComponent(detail.value.code), {
		method: "PATCH",
		headers: headers(true),
		body: JSON.stringify(Object.assign({ shipId: shipId.value }, body))
	});
	if (!response.ok) {
		error.value = "The update was rejected.";
		return;
	}
	detail.value = await response.json();
	loadedComment.value = detail.value.comment || "";
	syncShip();
	await loadLists();
}

function saveStatus(account) {
	patch({ roster: { [account.id]: { status: account.status } } });
}

function saveSystem(system) {
	patch({
		systems: {
			[system.id]: {
				name: system.name,
				state: system.state,
				options: system.options,
				clearance: system.clearance || "crew",
				level: system.level || "NOTICE"
			}
		}
	});
}

function choices(system) {
	const parts = String(system.options || "").split(";").map((part) => part.trim()).filter(Boolean);
	if (system.state && parts.indexOf(system.state) === -1) parts.unshift(system.state);
	return parts;
}

function slug(name, taken) {
	const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "system";
	let id = base;
	let n = 2;
	while (taken.has(id)) {
		id = (base + "-" + n).slice(0, 48);
		n += 1;
	}
	return id;
}

function addSystem() {
	const ship = selectedShip();
	const name = newName.value.trim();
	if (!ship || !name) return;
	const taken = new Set(ship.systems.map((system) => system.id));
	const options = newOptions.value.trim() || "Offline;Standby;Online";
	const state = options.split(/[;,]/)[0].trim() || "Offline";
	patch({
		systems: {
			[slug(name, taken)]: {
				name: name,
				state: state,
				options: options,
				clearance: "crew",
				level: "NOTICE"
			}
		}
	}).then(function () {
		newName.value = "";
		newOptions.value = "Offline;Standby;Online";
	});
}

async function deleteTable(code) {
	const sure = window.confirm("Delete table " + code + "? This cannot be undone.");
	if (!sure) return;
	error.value = "";
	const response = await fetch("api/gm/tables/" + encodeURIComponent(code), {
		method: "DELETE",
		headers: headers()
	});
	if (!response.ok) {
		error.value = "That table could not be deleted.";
		return;
	}
	if (detail.value && detail.value.code === code) {
		detail.value = null;
		loadedComment.value = "";
		page.value = "list";
	}
	await loadLists();
}

function removeSystem(system) {
	patch({ deleteSystem: system.id });
}

function shipOn(id) {
	return Boolean(detail.value && detail.value.ships.some((ship) => ship.id === id));
}

function toggleShip(id, on) {
	const ids = detail.value.ships.map((ship) => ship.id);
	const next = on ? (ids.indexOf(id) === -1 ? ids.concat(id) : ids) : ids.filter((ship) => ship !== id);
	if (!next.length) {
		error.value = "A table needs at least one ship.";
		return;
	}
	const home = next.indexOf(detail.value.homeShip) === -1 ? next[0] : detail.value.homeShip;
	patch({ ships: next, home: home });
}

function makeHome(id) {
	if (detail.value && detail.value.homeShip === id) return;
	patch({ home: id });
}

function shipAccess(id) {
	const ship = ((detail.value && detail.value.ships) || []).find((item) => item.id === id);
	return Boolean(ship && ship.playerAccess);
}

function toggleAccess(id) {
	if (!detail.value) return;
	patch({ access: { [id]: !shipAccess(id) } });
}

function saveComment() {
	patch({ comment: detail.value.comment });
}

function movePersonal() {
	if (!moveAccount.value || !moveTo.value) return;
	patch({ transfer: { accountId: moveAccount.value, fromShip: shipId.value, toShip: moveTo.value } }).then(function () {
		moveAccount.value = "";
		moveTo.value = "";
	});
}

function pushLog() {
	const text = logText.value.trim();
	if (!text) return;
	patch({ appendLog: { text: text, clearance: [logClearance.value] } }).then(function () {
		logText.value = "";
	});
}

function pushReply() {
	if (!replyTo.value || !replyFrom.value || !replySubject.value.trim() || !replyBody.value.trim()) return;
	patch({
		appendMail: {
			from: replyFrom.value,
			to: replyTo.value,
			subject: replySubject.value.trim(),
			body: replyBody.value.trim()
		}
	}).then(function () {
		replySubject.value = "";
		replyBody.value = "";
	});
}

function selectShip(id) {
	shipId.value = id;
	syncShip();
}

const selectedShip = function () {
	return (detail.value && detail.value.ships || []).find((ship) => ship.id === shipId.value) || null;
};

onMounted(function () {
	if (token.value) loadLists().catch(function () { error.value = "The GM desk could not be loaded."; });
	timer = window.setInterval(function () {
		if (detail.value) refreshDetail();
	}, 5000);
});

onUnmounted(function () {
	window.clearInterval(timer);
});
</script>

<template>
	<div class="gm">
		<h1>GM desk</h1>
		<p class="hint">Create a table, then give the players that table's URL. Each ship on the table has its own MU/TH/UR.</p>
		<label class="gm-token">
			GM token
			<input v-model="token" type="password" autocomplete="off" />
		</label>
		<button class="term-btn" type="button" @click="saveToken">Open desk</button>
		<p v-if="error" class="error">{{ error }}</p>

		<template v-if="page === 'create'">
			<button class="term-btn quiet" type="button" @click="backToTables">Back to tables</button>
			<h2>Create table</h2>
			<form @submit.prevent="createTable">
				<label>Scenario preset
					<select :value="createPreset" @change="chooseScenario($event.target.value)">
						<option value="" disabled>Choose a preset</option>
						<option v-for="scenario in starts" :key="scenario.id" :value="scenario.id">{{ scenario.name }}</option>
					</select>
				</label>
				<h3>Ships on this table</h3>
				<div v-for="ship in catalog" :key="ship.id" class="gm-row">
					<label><input type="checkbox" :checked="createShips.includes(ship.id)" @change="configureShip(ship.id, $event.target.checked)" /> {{ ship.name }}</label>
				</div>
				<label>Home computer
					<select v-model="createHome" :disabled="!createShips.length">
						<option v-for="ship in catalog.filter((item) => createShips.includes(item.id))" :key="ship.id" :value="ship.id">{{ ship.name }}</option>
					</select>
				</label>
				<p class="hint">Players start on the home computer. Configure player access and roster after creation.</p>
				<button class="term-btn" type="submit" :disabled="creating || !createShips.length">{{ creating ? "Creating…" : "Create table" }}</button>
			</form>
		</template>

		<template v-if="page === 'list'">
			<button class="term-btn" type="button" :disabled="!starts.length" @click="showCreate">Create table</button>
			<h2>Tables</h2>
			<table v-if="tables.length" class="gm-table">
				<thead>
					<tr>
						<th>Table</th>
						<th>Ships</th>
						<th>Added</th>
						<th>Comment</th>
						<th>Created</th>
						<th>Player</th>
						<th>GM</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="table in tables" :key="table.code">
						<td>
							<button class="term-btn" :class="{ on: detail && detail.code === table.code }" type="button" @click="openTable(table.code)">{{ table.code }}</button>
							<div><a :href="playerUrl(table.code)">Player link</a></div>
						</td>
						<td>{{ table.name }}</td>
						<td>{{ addedText(table.added) }}</td>
						<td>{{ table.comment || "—" }}</td>
						<td>{{ when(table.createdAt) }}</td>
						<td>{{ when(table.playerSeenAt) }}</td>
						<td>{{ when(table.gmSeenAt) }}</td>
						<td><button class="term-btn quiet" type="button" @click="deleteTable(table.code)">Delete table</button></td>
					</tr>
				</tbody>
			</table>
			<p v-else class="hint">No tables yet.</p>
		</template>

		<template v-if="page === 'detail' && detail">
			<button class="term-btn quiet" type="button" @click="backToTables">Back to tables</button>
			<h2>{{ detail.name }}  {{ detail.code }}</h2>
			<p class="hint">Players start on the home computer. Close a computer when that ship is lost. Other computers stay closed until you open them.</p>
			<p class="player-url"><a :href="playerUrl(detail.code)">{{ playerUrl(detail.code) }}</a></p>
			<p class="meta">Created {{ when(detail.createdAt) }} · Player {{ when(detail.playerSeenAt) }} · GM {{ when(detail.gmSeenAt) }}</p>
			<p class="hint">{{ addedText(detail.added) }}</p>
			<label>
				Comment
				<textarea v-model="detail.comment" class="scratch" data-field="comment"></textarea>
			</label>
			<button class="term-btn" type="button" @click="saveComment">Save comment</button>
			<button class="term-btn quiet" type="button" @click="deleteTable(detail.code)">Delete table</button>

			<h2>Ships on this table</h2>
			<div v-for="ship in detail.catalog" :key="ship.id" class="gm-row">
				<label>
					<input
						type="checkbox"
						:checked="shipOn(ship.id)"
						@change="toggleShip(ship.id, $event.target.checked)"
					/>
					{{ ship.computer }} · {{ ship.name }}
				</label>
				<button
					v-if="shipOn(ship.id)"
					class="term-btn"
					:class="{ on: detail.homeShip === ship.id }"
					type="button"
					@click="makeHome(ship.id)"
				>{{ detail.homeShip === ship.id ? "Home computer" : "Make home" }}</button>
				<button
					v-if="shipOn(ship.id)"
					class="term-btn"
					:class="{ on: shipAccess(ship.id) }"
					type="button"
					@click="toggleAccess(ship.id)"
				>{{ shipAccess(ship.id) ? "Close to players" : "Open to players" }}</button>
				<a v-if="shipOn(ship.id) && shipAccess(ship.id)" :href="playerUrl(detail.code, ship.id)">Link</a>
			</div>

			<div class="folder-row">
				<button
					v-for="ship in detail.ships"
					:key="ship.id"
					class="term-btn"
					:class="{ on: ship.id === shipId }"
					type="button"
					@click="selectShip(ship.id)"
				>{{ ship.computer }}</button>
			</div>

			<template v-if="selectedShip()">
				<h2>Roster · {{ selectedShip().name }}</h2>
				<div v-for="account in selectedShip().accounts" :key="account.id" class="gm-row">
					<span>{{ account.name }} <small>{{ account.job }}</small></span>
					<input v-model="account.status" type="text" />
					<button class="term-btn" type="button" @click="saveStatus(account)">Save</button>
				</div>

				<h2>Systems status</h2>
				<p class="hint">Options are separated by semicolons. Clearance is the minimum access that can see the line. Level is NOTICE, WARNING, or CRITICAL.</p>
				<div v-for="system in selectedShip().systems" :key="system.id" class="gm-row">
					<input v-model="system.name" type="text" />
					<select v-model="system.state">
						<option v-for="option in choices(system)" :key="option" :value="option">{{ option }}</option>
					</select>
					<select v-model="system.clearance">
						<option value="public">public</option>
						<option value="crew">crew</option>
						<option value="security">security</option>
						<option value="research">research</option>
						<option value="command">command</option>
						<option value="company">company</option>
					</select>
					<select v-model="system.level">
						<option value="NOTICE">NOTICE</option>
						<option value="WARNING">WARNING</option>
						<option value="CRITICAL">CRITICAL</option>
					</select>
					<input v-model="system.options" type="text" placeholder="Open;Closed;Locked" />
					<button class="term-btn" type="button" @click="saveSystem(system)">Save</button>
					<button class="term-btn quiet" type="button" @click="removeSystem(system)">Remove</button>
				</div>
				<div class="gm-row">
					<input v-model="newName" type="text" placeholder="New status line" />
					<input v-model="newOptions" type="text" placeholder="Offline;Standby;Online" />
					<button class="term-btn" type="button" @click="addSystem">Add line</button>
				</div>

				<h2>Move personal data</h2>
				<p class="hint">Mail and station notes only. Schematics, logs, and ship status stay.</p>
				<div class="gm-row">
					<select v-model="moveAccount">
						<option value="">Person</option>
						<option
							v-for="account in selectedShip().accounts.filter((item) => item.id !== 'public')"
							:key="account.id"
							:value="account.id"
						>{{ account.name }}</option>
					</select>
					<select v-model="moveTo">
						<option value="">Destination computer</option>
						<option
							v-for="ship in detail.ships.filter((item) => item.id !== shipId)"
							:key="ship.id"
							:value="ship.id"
						>{{ ship.name }}</option>
					</select>
					<button class="term-btn" type="button" @click="movePersonal">Move</button>
				</div>

				<h2>Push a log</h2>
				<textarea v-model="logText" class="scratch"></textarea>
				<div class="actions">
					<select v-model="logClearance">
						<option>crew</option>
						<option>security</option>
						<option>research</option>
						<option>command</option>
						<option>company</option>
					</select>
					<button class="term-btn" type="button" @click="pushLog">Push log</button>
				</div>
			</template>

			<h2>Live messages</h2>
			<article v-for="message in detail.messages" :key="message.shipId + message.id" class="panel">
				<h3>{{ message.subject }}</h3>
				<p class="meta">{{ message.shipName }} · {{ message.from }} → {{ message.to }}  {{ message.time || "" }}</p>
				<p>{{ message.body }}</p>
			</article>
			<p v-if="!detail.messages.length" class="hint">No live messages yet.</p>

			<h2>Reply as a contact</h2>
			<div class="gm-row">
				<select v-model="replyFrom">
					<option v-for="contact in (selectedShip() && selectedShip().contacts) || []" :key="contact.id" :value="contact.id">{{ contact.name }}</option>
				</select>
				<select v-model="replyTo">
					<option value="">Recipient</option>
					<option
						v-for="account in (selectedShip() && selectedShip().accounts) || []"
						:key="account.id"
						:value="account.id"
					>{{ account.name }}</option>
				</select>
			</div>
			<input v-model="replySubject" type="text" placeholder="Subject" />
			<textarea v-model="replyBody" class="scratch"></textarea>
			<button class="term-btn" type="button" @click="pushReply">Send</button>
		</template>
	</div>
</template>
