<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import GmLinkTools from "./GmLinkTools.vue";
import GmTableEditor from "./GmTableEditor.vue";

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
const saving = ref(false);
const notice = ref("");
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
	syncShip();
	await loadLists();
}

async function refreshDetail() {
	if (!detail.value || saving.value) return;
	const code = detail.value.code;
	const response = await fetch("api/gm/tables/" + encodeURIComponent(code), {
		headers: headers(),
		cache: "no-store"
	});
	if (!response.ok) return;
	const next = await response.json();
	if (!detail.value || detail.value.code !== next.code) return;
	detail.value.currentDate = next.currentDate;
	detail.value.messages = next.messages;
	for (const ship of detail.value.ships) {
		const fresh = next.ships.find(item => item.id === ship.id);
		if (fresh && JSON.stringify(ship.mail) !== JSON.stringify(fresh.mail)) ship.mail = fresh.mail;
	}
	detail.value.revision = next.revision;
	detail.value.added = next.added;
	detail.value.playerSeenAt = next.playerSeenAt;
	detail.value.gmSeenAt = next.gmSeenAt;

}

async function patch(body, done) {
	if (saving.value || !detail.value) return;
	saving.value = true;
	error.value = "";
	notice.value = "";
	try {
		const response = await fetch("api/gm/tables/" + encodeURIComponent(detail.value.code), {
			method: "PATCH", headers: headers(true),
			body: JSON.stringify(Object.assign({ shipId: shipId.value }, body))
		});
		if (!response.ok) { const result = await response.json(); error.value = result.error || "The update was rejected."; return; }
		detail.value = await response.json();
		syncShip();
		if (done) done();
		notice.value = "Changes saved.";
	} catch { error.value = "The update could not be saved. Check your connection and try again."; }
	finally { saving.value = false; }
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
		page.value = "list";
	}
	await loadLists();
}

function selectShip(id) { shipId.value = id; notice.value = ""; error.value = ""; }

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
							<div><a :href="playerUrl(table.code)">Campaign link</a> <GmLinkTools :link="playerUrl(table.code)" :title="'Campaign ' + table.code" /></div>
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
			<p v-if="notice" class="hint" role="status">{{ notice }}</p>
			<fieldset class="gm-editor-fieldset" :disabled="saving">
				<GmTableEditor :detail="detail" :ship-id="shipId" :player-url="playerUrl" @patch="patch" @select-ship="selectShip" @delete="deleteTable" />
			</fieldset>
		</template>
	</div>
</template>
