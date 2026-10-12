<script setup>
import { ref, watch } from "vue";
const props = defineProps({ ship: Object });
const emit = defineEmits(["patch"]);
const blank = () => ({
	name: "",
	systemChanges: [],
	rosterChanges: [],
	announcement: { enabled: false, title: "", body: "", time: "", from: "", clearance: ["public"] },
	mail: {
		enabled: false,
		subject: "",
		body: "",
		time: "",
		from: "",
		to: "crew",
		clearance: ["crew"],
	},
	log: { enabled: false, text: "", time: "", clearance: ["crew"] },
});
const draft = ref(blank());
const clearances = ["public", "crew", "security", "research", "command", "company"];
const statuses = [
	"Aboard",
	"Cryo",
	"Injured",
	"Unaccounted",
	"Deceased",
	"Deactivated",
	"Off ship",
];
watch(
	() => props.ship.id,
	() => {
		draft.value = blank();
	},
);
function edit(cue) {
	const copy = JSON.parse(JSON.stringify(cue));
	const changes = copy.changes;
	draft.value = {
		...blank(),
		id: copy.id,
		name: copy.name,
		systemChanges: Object.entries(changes.systems || {}).map(([id, fields]) => ({ id, ...fields })),
		rosterChanges: Object.entries(changes.roster || {}).map(([id, fields]) => ({ id, ...fields })),
		announcement: {
			...blank().announcement,
			...changes.saveAnnouncement,
			enabled: !!changes.saveAnnouncement,
		},
		mail: { ...blank().mail, ...changes.saveMail, enabled: !!changes.saveMail },
		log: { ...blank().log, ...changes.saveLog, enabled: !!changes.saveLog },
	};
}
function save() {
	const changes = {};
	if (draft.value.systemChanges.length)
		changes.systems = Object.fromEntries(
			draft.value.systemChanges.map(({ id, ...fields }) => [id, fields]),
		);
	if (draft.value.rosterChanges.length)
		changes.roster = Object.fromEntries(
			draft.value.rosterChanges.map(({ id, ...fields }) => [id, fields]),
		);
	for (const [field, key] of [
		["announcement", "saveAnnouncement"],
		["mail", "saveMail"],
		["log", "saveLog"],
	]) {
		if (draft.value[field].enabled) {
			const { enabled, ...content } = draft.value[field];
			changes[key] = content;
		}
	}
	emit("patch", { saveCue: { id: draft.value.id, name: draft.value.name, changes } }, () => {
		draft.value = blank();
	});
}
function push(cue) {
	if (window.confirm("Push prepared event “" + cue.name + "” to " + props.ship.name + "?"))
		emit("patch", { runCue: cue.id });
}
function remove(cue) {
	if (window.confirm("Delete prepared event “" + cue.name + "”?"))
		emit("patch", { deleteCue: cue.id });
}
function systemChoices(id) {
	const system = props.ship.systems.find((item) => item.id === id);
	return system ? [...new Set([system.state, ...system.options.split(";")])] : [];
}
</script>
<template>
	<section>
		<h2>Prepared events · {{ ship.name }}</h2>
		<p class="hint">
			Prepare changes before play. Push applies the entire event at once and players receive it on
			the next refresh. Saving an event does not change the terminal.
		</p>
		<article v-for="cue in ship.cues" :key="cue.id" class="panel">
			<h3>{{ cue.name }}</h3>
			<p class="meta">
				{{
					Object.keys(cue.changes)
						.map(
							(key) =>
								({
									systems: "Systems",
									roster: "Roster",
									saveAnnouncement: "Announcement",
									saveMail: "Mail",
									saveLog: "Log",
								})[key],
						)
						.join(" · ")
				}}
				·
				{{
					cue.lastPushedAt
						? "Last pushed " + new Date(cue.lastPushedAt).toLocaleString()
						: "Not pushed yet"
				}}
			</p>
			<details>
				<summary>Preview changes</summary>
				<p v-if="cue.changes.saveAnnouncement">
					{{ cue.changes.saveAnnouncement.title }} — {{ cue.changes.saveAnnouncement.body }}
				</p>
				<p v-if="cue.changes.saveMail">
					{{ cue.changes.saveMail.subject }} → {{ cue.changes.saveMail.to }} —
					{{ cue.changes.saveMail.body }}
				</p>
				<p v-if="cue.changes.saveLog">
					{{ cue.changes.saveLog.time }} — {{ cue.changes.saveLog.text }}
				</p>
				<p v-for="(fields, id) in cue.changes.systems || {}" :key="id">
					{{ ship.systems.find((item) => item.id === id)?.name || id }} → {{ fields.state }} ·
					{{ fields.level }}
				</p>
				<p v-for="(fields, id) in cue.changes.roster || {}" :key="id">
					{{ ship.accounts.find((item) => item.id === id)?.name || id }} → {{ fields.status }}
				</p>
			</details>
			<div class="actions">
				<button class="term-btn" type="button" @click="push(cue)">Push event</button
				><button class="term-btn quiet" type="button" @click="edit(cue)">Edit event</button
				><button class="term-btn quiet" type="button" @click="remove(cue)">Delete event</button>
			</div>
		</article>
		<p v-if="!ship.cues.length" class="hint">No prepared events yet.</p>
		<form class="panel" @submit.prevent="save">
			<h3>{{ draft.id ? "Edit prepared event" : "Prepare an event" }}</h3>
			<label>Event name<input v-model="draft.name" required maxlength="200" /></label>
			<h4>System changes</h4>
			<div v-for="(change, index) in draft.systemChanges" :key="index" class="gm-fields">
				<label
					>System<select
						v-model="change.id"
						required
						@change="change.state = systemChoices(change.id)[0] || ''"
					>
						<option value="">Choose system</option>
						<option v-for="system in ship.systems" :key="system.id" :value="system.id">
							{{ system.name }}
						</option>
					</select></label
				><label
					>State<select v-model="change.state" required>
						<option v-for="state in systemChoices(change.id)" :key="state">{{ state }}</option>
					</select></label
				><label
					>Severity<select v-model="change.level">
						<option>NOTICE</option>
						<option>WARNING</option>
						<option>CRITICAL</option>
					</select></label
				><button class="term-btn quiet" type="button" @click="draft.systemChanges.splice(index, 1)">
					Remove change
				</button>
			</div>
			<button
				class="term-btn quiet"
				type="button"
				@click="draft.systemChanges.push({ id: '', state: '', level: 'NOTICE' })"
			>
				Add system change
			</button>
			<h4>Roster changes</h4>
			<div v-for="(change, index) in draft.rosterChanges" :key="index" class="gm-fields">
				<label
					>Crew member<select v-model="change.id" required>
						<option value="">Choose crew member</option>
						<option v-for="account in ship.accounts" :key="account.id" :value="account.id">
							{{ account.name }}
						</option>
					</select></label
				><label
					>Status<select v-model="change.status">
						<option v-for="status in statuses" :key="status">{{ status }}</option>
					</select></label
				><button class="term-btn quiet" type="button" @click="draft.rosterChanges.splice(index, 1)">
					Remove change
				</button>
			</div>
			<button
				class="term-btn quiet"
				type="button"
				@click="draft.rosterChanges.push({ id: '', status: 'Aboard' })"
			>
				Add roster change
			</button>
			<h4>Transmissions</h4>
			<div
				v-for="[field, label] in [
					['announcement', 'Announcement'],
					['mail', 'Mail'],
					['log', 'Log entry'],
				]"
				:key="field"
			>
				<label class="gm-inline"
					><input v-model="draft[field].enabled" type="checkbox" /> Include
					{{ label.toLowerCase() }}</label
				>
				<div v-if="draft[field].enabled" class="panel">
					<div class="gm-fields">
						<label v-if="field === 'announcement'"
							>Title<input v-model="draft[field].title" required maxlength="200" /></label
						><label v-if="field === 'mail'"
							>Subject<input v-model="draft[field].subject" required maxlength="200" /></label
						><label
							>Date and time<input
								v-model="draft[field].time"
								maxlength="200"
								placeholder="2183-11-12 14:30" /></label
						><label
							>Visibility<select v-model="draft[field].clearance" multiple required>
								<option v-for="tag in clearances" :key="tag">{{ tag }}</option>
							</select></label
						><label v-if="field !== 'log'"
							>From<select v-model="draft[field].from" :required="field === 'mail'">
								<option value="">Unspecified</option>
								<option
									v-for="sender in [...ship.contacts, ...ship.accounts]"
									:key="sender.id"
									:value="sender.id"
								>
									{{ sender.name }}
								</option>
							</select></label
						><label v-if="field === 'mail'"
							>To<select v-model="draft[field].to" required>
								<option value="crew">Crew broadcast</option>
								<option value="public">Public broadcast</option>
								<option
									v-for="recipient in ship.accounts"
									:key="recipient.id"
									:value="recipient.id"
								>
									{{ recipient.name }}
								</option>
							</select></label
						>
					</div>
					<label
						>Text<textarea
							v-if="field === 'log'"
							v-model="draft[field].text"
							required
							maxlength="4000"
							rows="3"
						></textarea
						><textarea
							v-else
							v-model="draft[field].body"
							required
							maxlength="4000"
							rows="3"
						></textarea>
					</label>
				</div>
			</div>
			<div class="actions">
				<button class="term-btn" type="submit">Save prepared event</button
				><button class="term-btn quiet" type="button" @click="draft = blank()">Clear form</button>
			</div>
		</form>
	</section>
</template>
