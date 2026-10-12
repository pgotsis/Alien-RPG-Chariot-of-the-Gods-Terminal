<script setup>
import { ref, watch } from "vue";
const props = defineProps({ ship: Object });
const emit = defineEmits(["patch"]);
const clearances = ["public", "crew", "security", "research", "command", "company"];
const levels = ["NOTICE", "WARNING", "CRITICAL"];
const systems = ref([]);
const blank = () => ({
	name: "",
	state: "Online",
	options: "Online;Standby;Offline",
	clearance: "crew",
	level: "NOTICE",
	detail: {},
});
const newSystem = ref(blank());
watch(
	() => props.ship,
	(ship) => {
		systems.value = JSON.parse(JSON.stringify(ship.systems));
	},
	{ immediate: true },
);
function suggest(system) {
	const preset = props.ship.systemPresets.find((item) => item.name === system.name);
	if (preset) Object.assign(system, JSON.parse(JSON.stringify(preset)), { id: system.id });
}
function choices(system) {
	return [
		...new Set(
			[system.state, ...system.options.split(";").map((item) => item.trim())].filter(Boolean),
		),
	];
}
function save(system, fresh = false) {
	const id = fresh ? "system-" + crypto.randomUUID().slice(0, 8) : system.id;
	const { name, state, options, clearance, level, detail } = system;
	emit(
		"patch",
		{ systems: { [id]: { name, state, options, clearance, level, detail } } },
		fresh
			? () => {
					newSystem.value = blank();
				}
			: undefined,
	);
}
</script>

<template>
	<section>
		<h2>Systems · {{ ship.name }}</h2>
		<p class="hint">
			Choose a suggested system name to populate its adventure settings. Customize its state,
			visibility and severity below.
		</p>
		<datalist id="gm-system-names">
			<option v-for="preset in ship.systemPresets" :key="preset.id" :value="preset.name" />
		</datalist>
		<form
			v-for="system in [...systems, newSystem]"
			:key="system.id || 'new'"
			class="panel"
			@submit.prevent="save(system, !system.id)"
		>
			<h3>{{ system.id ? system.name : "Add system" }}</h3>
			<div class="gm-fields gm-system-fields">
				<label
					>System name<input
						v-model="system.name"
						list="gm-system-names"
						required
						maxlength="200"
						@change="suggest(system)"
				/></label>
				<label
					>State<select v-model="system.state">
						<option v-for="state in choices(system)" :key="state">{{ state }}</option>
					</select></label
				>
				<label
					>Visibility<select v-model="system.clearance">
						<option v-for="tag in clearances" :key="tag">{{ tag }}</option>
					</select></label
				>
				<label
					>Severity<select v-model="system.level">
						<option v-for="level in levels" :key="level">{{ level }}</option>
					</select></label
				>
			</div>
			<details>
				<summary>State choices and adventure details</summary>
				<label
					>State choices (separated by semicolons)<input
						v-model="system.options"
						required
						maxlength="4000"
				/></label>
				<div class="gm-fields">
					<label v-for="tag in clearances" :key="tag"
						>{{ tag }} detail<textarea
							v-model="system.detail[tag]"
							rows="2"
							maxlength="4000"
						></textarea>
					</label>
				</div>
			</details>
			<div class="actions">
				<button class="term-btn" type="submit">
					{{ system.id ? "Save system" : "Add system" }}
				</button>
				<button
					v-if="system.id"
					class="term-btn quiet"
					type="button"
					@click="emit('patch', { deleteSystem: system.id })"
				>
					Remove system
				</button>
			</div>
		</form>
	</section>
</template>
