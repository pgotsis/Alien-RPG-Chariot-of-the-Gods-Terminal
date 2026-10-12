<script setup>
import { ref, watch } from "vue";
const props = defineProps({ detail: Object });
const emit = defineEmits(["patch"]);
const facilities = ref([]);
const blank = () => ({ type: "Ship", name: "", aiName: "MU/TH/UR", aiVersion: "" });
const fresh = ref(blank());
const types = ["Ship", "Base", "Space Station", "Offices"];
watch(
	() => props.detail.ships,
	(list) => {
		facilities.value = list.map((item) => ({
			...JSON.parse(JSON.stringify(item)),
			facility: JSON.parse(JSON.stringify(item.facility)),
		}));
	},
	{ immediate: true },
);
function toggle(id, on) {
	const ids = props.detail.ships.map((item) => item.id);
	const next = on ? [...new Set([...ids, id])] : ids.filter((item) => item !== id);
	if (next.length)
		emit("patch", {
			ships: next,
			home: next.includes(props.detail.homeShip) ? props.detail.homeShip : next[0],
		});
}
</script>
<template>
	<section>
		<h2>Facility & access</h2>
		<p class="hint">
			Choose the home facility and open or close each location to players. Added facilities start
			closed; they have their own roster, systems and records.
		</p>
		<article v-for="item in facilities" :key="item.id" class="panel">
			<form @submit.prevent="emit('patch', { shipId: item.id, facility: item.facility })">
				<div class="gm-fields">
					<label>Facility name<input v-model="item.facility.name" required maxlength="200" /></label
					><label
						>Type<select v-model="item.facility.type">
							<option v-for="type in types" :key="type">{{ type }}</option>
						</select></label
					><label>AI name<input v-model="item.facility.aiName" required maxlength="200" /></label
					><label>Version<input v-model="item.facility.aiVersion" maxlength="200" /></label>
				</div>
				<div class="actions">
					<button class="term-btn" type="submit">Save facility</button
					><button class="term-btn quiet" type="button" @click="emit('patch', { home: item.id })">
						{{ detail.homeShip === item.id ? "Home base" : "Make home base" }}</button
					><button
						class="term-btn quiet"
						type="button"
						@click="emit('patch', { access: { [item.id]: !item.playerAccess } })"
					>
						{{ item.playerAccess ? "Close to players" : "Open to players" }}</button
					><button
						class="term-btn quiet"
						type="button"
						:disabled="facilities.length === 1"
						@click="toggle(item.id, false)"
					>
						Remove from table
					</button>
				</div>
			</form>
		</article>
		<details class="panel">
			<summary>Add an existing scenario facility</summary>
			<div
				v-for="item in detail.catalog.filter(
					(item) => !detail.ships.some((facility) => facility.id === item.id),
				)"
				:key="item.id"
			>
				<button class="term-btn quiet" type="button" @click="toggle(item.id, true)">
					Add {{ item.name }}
				</button>
			</div>
		</details>
		<h3>Add facility</h3>
		<form
			class="panel"
			@submit.prevent="
				emit('patch', { createFacility: fresh }, () => {
					fresh = blank();
				})
			"
		>
			<div class="gm-fields">
				<label>Facility name<input v-model="fresh.name" required maxlength="200" /></label
				><label
					>Type<select v-model="fresh.type">
						<option v-for="type in types" :key="type">{{ type }}</option>
					</select></label
				><label>AI name<input v-model="fresh.aiName" required maxlength="200" /></label
				><label>Version<input v-model="fresh.aiVersion" maxlength="200" /></label>
			</div>
			<button class="term-btn" type="submit">Add facility</button>
		</form>
	</section>
</template>
