<script setup>
import { computed, ref, watch } from "vue";
import GmFacilityEditor from "./GmFacilityEditor.vue";
import GmLinkTools from "./GmLinkTools.vue";
import GmCueEditor from "./GmCueEditor.vue";
import GmRosterEditor from "./GmRosterEditor.vue";
import GmSystemsEditor from "./GmSystemsEditor.vue";
import GmDocumentEditor from "./GmDocumentEditor.vue";
import GmBlueprintEditor from "./GmBlueprintEditor.vue";
import GmStarMapEditor from "./GmStarMapEditor.vue";
const props = defineProps({ detail: Object, shipId: String, playerUrl: Function });
const emit = defineEmits(["patch", "selectShip", "delete"]);
const section = ref("table");
const sections = [
	["table", "Table settings"],
	["cues", "Prepared events"],
	["ships", "Facility & access"],
	["roster", "Roster & PINs"],
	["systems", "Systems"],
	["blueprints", "Blueprints"],
	["starmap", "Star map"],
	["logs", "Logs"],
	["announcements", "Announcements"],
	["mail", "Mail"],
	["transfer", "Crew registration"],
];
const ship = computed(() => props.detail.ships.find((item) => item.id === props.shipId));
const baseDate = ref(props.detail.currentDate.slice(0, 16));
watch(
	() => props.detail.currentDate,
	(value) => {
		if (document.activeElement?.dataset.field !== "clock") baseDate.value = value.slice(0, 16);
	},
);
const comment = ref(props.detail.comment || "");
const moveAccount = ref("");
const moveTo = ref("");
function patch(body, done) {
	emit("patch", body, done);
}
function toggleShip(id, on) {
	const ids = props.detail.ships.map((item) => item.id);
	const next = on ? [...new Set([...ids, id])] : ids.filter((item) => item !== id);
	if (!next.length) return;
	patch({
		ships: next,
		home: next.includes(props.detail.homeShip) ? props.detail.homeShip : next[0],
	});
}
</script>

<template>
	<div class="gm-editor">
		<nav class="gm-sidebar" aria-label="Table editing sections">
			<button
				v-for="[id, label] in sections"
				:key="id"
				class="term-btn"
				:class="{ on: section === id }"
				:aria-current="section === id ? 'page' : undefined"
				type="button"
				@click="section = id"
			>
				{{ label }}
			</button>
		</nav>
		<div class="gm-section">
			<section v-if="section === 'table'">
				<h2>Table settings</h2>
				<p>
					<a :href="playerUrl(detail.code)">Campaign link · {{ detail.code }}</a>
					<GmLinkTools :link="playerUrl(detail.code)" :title="'Campaign ' + detail.code" />
				</p>
				<form class="panel" @submit.prevent="patch({ baseDate: baseDate + ':00Z' })">
					<h3>Terminal date & time</h3>
					<p class="hint">
						The campaign clock runs in real time. Set its base date or jump ahead. Message and log
						dates are unchanged. Campaign times use UTC.
					</p>
					<div class="gm-fields">
						<label
							>Base date<input
								v-model="baseDate"
								type="datetime-local"
								required
								data-field="clock" /></label
						><button class="term-btn" type="submit">Set date</button>
					</div>
					<div class="actions">
						<button
							v-for="[minutes, label] in [
								[5, '5 min'],
								[30, '30 min'],
								[60, '1 hour'],
								[120, '2 hours'],
								[180, '3 hours'],
								[300, '5 hours'],
							]"
							:key="minutes"
							class="term-btn quiet"
							type="button"
							@click="patch({ advanceMinutes: minutes })"
						>
							+ {{ label }}
						</button>
					</div>
				</form>
				<label
					>Comment<textarea v-model="comment" class="scratch" data-field="comment"></textarea>
				</label>
				<div class="actions">
					<button class="term-btn" type="button" @click="patch({ comment })">Save comment</button
					><button class="term-btn quiet" type="button" @click="emit('delete', detail.code)">
						Delete table
					</button>
				</div>
			</section>
			<GmFacilityEditor v-else-if="section === 'ships'" :detail="detail" @patch="patch" />
			<template v-else-if="ship">
				<nav class="folder-row" aria-label="Ship to edit">
					<button
						v-for="item in detail.ships"
						:key="item.id"
						class="term-btn"
						:class="{ on: item.id === shipId }"
						type="button"
						@click="emit('selectShip', item.id)"
					>
						{{ item.name }}
					</button>
				</nav>
				<GmCueEditor v-if="section === 'cues'" :ship="ship" @patch="patch" />
				<GmRosterEditor
					v-else-if="section === 'roster'"
					:ship="ship"
					:portraits="detail.portraits"
					:facilities="detail.ships"
					:table-code="detail.code"
					:player-url="playerUrl"
					@patch="patch"
				/>
				<GmSystemsEditor v-else-if="section === 'systems'" :ship="ship" @patch="patch" />
				<GmBlueprintEditor
					v-else-if="section === 'blueprints'"
					:ship="ship"
					:images="detail.blueprintImages"
					:table-code="detail.code"
					@patch="patch"
				/>
				<GmStarMapEditor
					:images="detail.starMapImages"
					v-else-if="section === 'starmap'"
					:ship="ship"
					:table-code="detail.code"
					@patch="patch"
				/>
				<GmDocumentEditor
					v-else-if="section === 'logs'"
					key="logs"
					kind="Log"
					:ship="ship"
					:entries="ship.logs"
					@patch="patch"
				/>
				<GmDocumentEditor
					v-else-if="section === 'announcements'"
					key="announcements"
					kind="Announcement"
					:ship="ship"
					:entries="ship.announcements"
					@patch="patch"
				/>
				<GmDocumentEditor
					v-else-if="section === 'mail'"
					key="mail"
					kind="Mail"
					:ship="ship"
					:entries="ship.mail"
					@patch="patch"
				/>
				<section v-else-if="section === 'transfer'">
					<h2>Register crew at another facility</h2>
					<p class="hint">
						Use this when crew leave one facility and board another, such as Montero to Cronus or a
						ship to a station. Select their current facility above and register them at the
						destination below. Their personal mail and notes are shared across the table and
						available at every facility where they are registered; nothing is copied or removed. The
						source registration remains, so you may mark the crew member Off ship separately.
						Facility logs, broadcasts, systems, blueprints and ship files stay local. Only the GM
						can register crew, including at a facility that is still closed to players.
					</p>
					<form
						@submit.prevent="
							patch(
								{ transfer: { accountId: moveAccount, fromShip: shipId, toShip: moveTo } },
								() => {
									moveAccount = '';
									moveTo = '';
								},
							)
						"
					>
						<div class="gm-fields">
							<label
								>Person<select v-model="moveAccount" required>
									<option value="">Select crew member</option>
									<option v-for="account in ship.accounts" :key="account.id" :value="account.id">
										{{ account.name }}
									</option>
								</select></label
							><label
								>Destination facility<select v-model="moveTo" required>
									<option value="">Select facility</option>
									<option
										v-for="item in detail.ships.filter((item) => item.id !== shipId)"
										:key="item.id"
										:value="item.id"
									>
										{{ item.name }}
									</option>
								</select></label
							>
						</div>
						<button class="term-btn" type="submit">Register crew</button>
					</form>
				</section>
			</template>
		</div>
	</div>
</template>
