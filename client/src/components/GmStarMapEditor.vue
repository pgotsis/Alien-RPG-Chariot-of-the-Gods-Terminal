<script setup>
import { ref, watch } from "vue";
import StarMapPlot from "./StarMapPlot.vue";
const props = defineProps({ ship: Object });
const emit = defineEmits(["patch"]);
const map = ref(null);
watch(
	() => props.ship,
	(ship) => {
		map.value = JSON.parse(JSON.stringify(ship.starMap));
	},
	{ immediate: true },
);
</script>
<template>
	<section>
		<h2>Star map · {{ ship.name }}</h2>
		<p class="hint">
			Command and company personnel can view this navigation plot. Coordinates run from 0 to 100 on
			a schematic grid.
		</p>
		<form @submit.prevent="emit('patch', { starMap: map })">
			<div class="gm-fields">
				<label
					>Ship position / system<input
						v-model="map.position.name"
						required
						maxlength="200"
						placeholder="26 Draconis · LV-1113" /></label
				><label
					>X<input
						v-model.number="map.position.x"
						type="number"
						min="0"
						max="100"
						step="any"
						required /></label
				><label
					>Y<input
						v-model.number="map.position.y"
						type="number"
						min="0"
						max="100"
						step="any"
						required /></label
				><label
					>Position date<input
						v-model="map.updatedAt"
						maxlength="200"
						placeholder="2183-11-12 14:30"
				/></label>
			</div>
			<StarMapPlot :map="map" :ship-name="ship.name" />
			<h3>Systems and waypoints</h3>
			<div v-for="(point, index) in map.locations" :key="index" class="gm-fields panel">
				<label>Name<input v-model="point.name" required maxlength="200" /></label
				><label
					>X<input
						v-model.number="point.x"
						type="number"
						min="0"
						max="100"
						step="any"
						required /></label
				><label
					>Y<input
						v-model.number="point.y"
						type="number"
						min="0"
						max="100"
						step="any"
						required /></label
				><button class="term-btn quiet" type="button" @click="map.locations.splice(index, 1)">
					Remove waypoint
				</button>
			</div>
			<button
				class="term-btn quiet"
				type="button"
				@click="map.locations.push({ name: '', x: 50, y: 50 })"
			>
				Add waypoint
			</button>
			<label
				>Navigation notes<textarea v-model="map.notes" maxlength="4000" rows="3"></textarea>
			</label>
			<button class="term-btn" type="submit">Save star map</button>
		</form>
	</section>
</template>
