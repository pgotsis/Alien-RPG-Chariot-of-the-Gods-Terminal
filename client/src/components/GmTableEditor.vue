<script setup>
import { computed, ref } from "vue";
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
	["ships", "Ships & access"],
	["roster", "Roster & PINs"],
	["systems", "Systems"],
	["blueprints", "Blueprints"],
	["starmap", "Star map"],
	["logs", "Logs"],
	["announcements", "Announcements"],
	["mail", "Mail"],
	["transfer", "Move personal data"],
];
const ship = computed(() => props.detail.ships.find((item) => item.id === props.shipId));
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
					<a :href="playerUrl(detail.code)">Player link · {{ detail.code }}</a>
				</p>
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
			<section v-else-if="section === 'ships'">
				<h2>Ships & player access</h2>
				<p class="hint">
					Players start on the home ship. At least one ship must remain on the table.
				</p>
				<article v-for="item in detail.catalog" :key="item.id" class="panel">
					<label class="gm-inline"
						><input
							type="checkbox"
							:checked="detail.ships.some((ship) => ship.id === item.id)"
							:disabled="detail.ships.length === 1 && detail.ships[0].id === item.id"
							@change="toggleShip(item.id, $event.target.checked)"
						/>
						{{ item.name }}</label
					>
					<div v-if="detail.ships.some((ship) => ship.id === item.id)" class="actions">
						<button
							class="term-btn"
							type="button"
							:class="{ on: detail.homeShip === item.id }"
							@click="patch({ home: item.id })"
						>
							{{ detail.homeShip === item.id ? "Home ship" : "Make home ship" }}
						</button>
						<button
							class="term-btn"
							type="button"
							@click="
								patch({
									access: {
										[item.id]: !detail.ships.find((ship) => ship.id === item.id).playerAccess,
									},
								})
							"
						>
							{{
								detail.ships.find((ship) => ship.id === item.id).playerAccess
									? "Close to players"
									: "Open to players"
							}}
						</button>
					</div>
				</article>
			</section>
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
					@patch="patch"
				/>
				<GmSystemsEditor v-else-if="section === 'systems'" :ship="ship" @patch="patch" />
				<GmBlueprintEditor
					v-else-if="section === 'blueprints'"
					:ship="ship"
					:images="detail.blueprintImages"
					@patch="patch"
				/>
				<GmStarMapEditor v-else-if="section === 'starmap'" :ship="ship" @patch="patch" />
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
					<h2>Move personal data</h2>
					<p class="hint">
						Move mail and station notes; schematics, logs and status stay on their ship.
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
								>Destination ship<select v-model="moveTo" required>
									<option value="">Select ship</option>
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
						<button class="term-btn" type="submit">Move personal data</button>
					</form>
				</section>
			</template>
		</div>
	</div>
</template>
