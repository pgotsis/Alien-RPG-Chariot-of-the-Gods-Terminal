<script setup>
import GmClearanceSelect from "./GmClearanceSelect.vue";
import { ref, watch } from "vue";
const props = defineProps({ ship: Object, portraits: Array });
const emit = defineEmits(["patch"]);
const statuses = [
	"Aboard",
	"Cryo",
	"Injured",
	"Unaccounted",
	"Deceased",
	"Deactivated",
	"Off ship",
];
const crew = ref([]);
const fresh = () => ({
	name: "",
	job: "",
	status: "Aboard",
	clearance: ["crew"],
	pin: "",
	photo: "",
});
const newCrew = ref(fresh());
watch(
	() => props.ship,
	(ship) => {
		crew.value = JSON.parse(JSON.stringify(ship.accounts)).map((account) => ({
			...account,
			pin: "",
		}));
	},
	{ immediate: true },
);
function save(account) {
	const { id, name, job, status, clearance, pin, photo } = account;
	emit("patch", { updateCrew: { id, name, job, status, clearance, pin, photo } });
}
function add() {
	emit("patch", { createCrew: { ...newCrew.value } }, () => {
		newCrew.value = fresh();
	});
}
function availableStatuses(account) {
	return [...new Set([account.status, ...statuses].filter(Boolean))];
}
</script>

<template>
	<section>
		<h2>Roster · {{ ship.name }}</h2>
		<p class="hint">
			Changes apply to this table. Leave the PIN blank to keep the current access code.
		</p>
		<form
			v-for="account in crew"
			:key="account.id"
			class="panel gm-crew-card"
			@submit.prevent="save(account)"
		>
			<img v-if="account.photo" class="gm-portrait" :src="account.photo" :alt="account.name" />
			<div class="gm-fields">
				<label>Name<input v-model="account.name" required maxlength="200" /></label>
				<label>Title<input v-model="account.job" required maxlength="200" /></label>
				<label
					>Status<select v-model="account.status">
						<option v-for="status in availableStatuses(account)" :key="status">{{ status }}</option>
					</select></label
				>
				<label>Clearance<GmClearanceSelect v-model="account.clearance" required /></label>
				<label
					>New PIN<input
						v-model="account.pin"
						type="password"
						inputmode="numeric"
						pattern="[0-9]{4,12}"
						minlength="4"
						maxlength="12"
						autocomplete="new-password"
						:placeholder="account.hasPin ? 'Keep current PIN' : 'No PIN assigned'"
				/></label>
			</div>
			<button class="term-btn" type="submit">Save crew member</button>
		</form>
		<h3>Add crew member</h3>
		<form class="panel" @submit.prevent="add">
			<div class="gm-fields">
				<label>Name<input v-model="newCrew.name" required maxlength="200" /></label>
				<label>Title<input v-model="newCrew.job" required maxlength="200" /></label>
				<label
					>Status<select v-model="newCrew.status">
						<option v-for="status in statuses" :key="status">{{ status }}</option>
					</select></label
				>
				<label>Clearance<GmClearanceSelect v-model="newCrew.clearance" required /></label>
				<label
					>PIN code<input
						v-model="newCrew.pin"
						type="password"
						inputmode="numeric"
						pattern="[0-9]{4,12}"
						minlength="4"
						maxlength="12"
						required
						autocomplete="new-password"
				/></label>
			</div>
			<fieldset class="gm-portraits">
				<legend>Unused portraits</legend>
				<label class="gm-portrait-choice"
					><input v-model="newCrew.photo" type="radio" value="" /> No portrait</label
				>
				<label
					v-for="portrait in portraits"
					:key="portrait.url"
					class="gm-portrait-choice"
					:class="{ on: newCrew.photo === portrait.url }"
				>
					<input v-model="newCrew.photo" type="radio" :value="portrait.url" />
					<img :src="portrait.url" :alt="portrait.stem.replaceAll('_', ' ')" loading="lazy" />
					<span>{{ portrait.stem.replaceAll("_", " ") }}</span>
				</label>
			</fieldset>
			<button class="term-btn" type="submit">Add crew member</button>
		</form>
	</section>
</template>
