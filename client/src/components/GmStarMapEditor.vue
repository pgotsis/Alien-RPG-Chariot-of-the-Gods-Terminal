<script setup>
import { ref, watch } from "vue";
import GmImageUpload from "./GmImageUpload.vue";
import StarMapPlot from "./StarMapPlot.vue";
const props = defineProps({ ship: Object, tableCode: String });
const emit = defineEmits(["patch"]);
const map = ref(null);
const backgroundError = ref("");
const uploading = ref(false);
const locations = [
	"Position unconfirmed",
	"Sol",
	"Gateway Station",
	"26 Draconis",
	"LV-1113",
	"XCD-14",
	"Impon VII",
	"Anchorpoint Station",
	"LV-426",
	"Sutter's World",
	"KG-348",
	"Custom position",
];
const chosenPosition = ref("Position unconfirmed");
function choosePosition() {
	if (chosenPosition.value !== "Custom position") map.value.position.name = chosenPosition.value;
}

watch(
	() => props.ship,
	(ship) => {
		map.value = {
			background: "",
			backgroundOpacity: 0.7,
			backgroundFit: "contain",
			...JSON.parse(JSON.stringify(ship.starMap)),
		};
		backgroundError.value = "";
		chosenPosition.value = locations.includes(map.value.position.name)
			? map.value.position.name
			: "Custom position";
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
					>Ship position / system<select v-model="chosenPosition" @change="choosePosition">
						<option v-for="location in locations" :key="location">{{ location }}</option></select
					><input
						v-if="chosenPosition === 'Custom position'"
						v-model="map.position.name"
						required
						maxlength="200"
						placeholder="System or facility name" /></label
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
			<details class="panel">
				<summary>Background image</summary>
				<div class="gm-fields">
					<label
						>Image URL<input
							:value="map.background.startsWith('data:') ? '' : map.background"
							placeholder="https://example.com/star-map.jpg"
							maxlength="2048"
							@input="map.background = $event.target.value"
					/></label>
					<label
						>Upload image<GmImageUpload
							:table-code="tableCode"
							@uploaded="map.background = $event"
							@busy="uploading = $event"
					/></label>
					<label
						>Image fit<select v-model="map.backgroundFit">
							<option value="contain">Fit whole image</option>
							<option value="cover">Fill map area</option>
						</select></label
					>
					<label
						>Opacity<input
							v-model.number="map.backgroundOpacity"
							type="range"
							min="0"
							max="1"
							step="0.05"
					/></label>
				</div>
				<p class="hint">
					PNG, JPEG or WebP, up to 2 MB. Uploaded backgrounds are saved with this table.
				</p>
				<p v-if="backgroundError" class="error" role="alert">{{ backgroundError }}</p>
				<button
					v-if="map.background"
					class="term-btn quiet"
					type="button"
					@click="
						map.background = '';
						backgroundError = '';
					"
				>
					Remove background
				</button>
			</details>
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
			<button class="term-btn" type="submit" :disabled="uploading">Save star map</button>
		</form>
	</section>
</template>
