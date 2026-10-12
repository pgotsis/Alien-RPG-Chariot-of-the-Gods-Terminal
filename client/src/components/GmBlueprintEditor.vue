<script setup>
import { ref, watch } from "vue";
const props = defineProps({ ship: Object, images: Array });
const emit = defineEmits(["patch"]);
const tags = ["public", "crew", "security", "research", "command", "company"];
const draft = ref(null);
const roomId = ref("");
watch(
	() => props.ship,
	(ship) => {
		draft.value = JSON.parse(JSON.stringify(ship.blueprints));
		for (const room of Object.values(draft.value.rooms)) {
			room.text ||= {};
			room.requires ||= [];
		}
	},
	{ immediate: true },
);
function addDeck() {
	draft.value.decks.push({
		id: "deck-" + crypto.randomUUID().slice(0, 8),
		name: "New deck",
		width: 500,
		height: 1000,
		schematics: {},
		hotspots: [],
	});
}
function addRoom() {
	if (/^[a-z0-9-]{1,64}$/.test(roomId.value) && !draft.value.rooms[roomId.value]) {
		draft.value.rooms[roomId.value] = { name: roomId.value, requires: [], text: {} };
		roomId.value = "";
	}
}
</script>
<template>
	<section>
		<h2>Blueprints · {{ ship.name }}</h2>
		<p class="hint">
			Assign an image for each clearance. Use a listed image or an HTTPS image URL. Blank layers
			fall back to a lower clearance. Coordinates use the deck image dimensions.
		</p>
		<datalist id="blueprint-images">
			<option v-for="image in images" :key="image" :value="image" />
		</datalist>
		<form @submit.prevent="emit('patch', { blueprints: draft })">
			<h3>Ship overview</h3>
			<div class="gm-fields">
				<label v-for="tag in tags" :key="tag"
					>{{ tag }} image<input
						v-model="draft.overview[tag]"
						list="blueprint-images"
						maxlength="1000"
				/></label>
			</div>
			<article v-for="(deck, index) in draft.decks" :key="deck.id" class="panel">
				<div class="gm-fields">
					<label>Deck name<input v-model="deck.name" required maxlength="200" /></label
					><label
						>Image width<input
							v-model.number="deck.width"
							type="number"
							min="1"
							max="20000"
							required /></label
					><label
						>Image height<input
							v-model.number="deck.height"
							type="number"
							min="1"
							max="20000"
							required
					/></label>
				</div>
				<div class="gm-fields">
					<label v-for="tag in tags" :key="tag"
						>{{ tag }} image<input
							v-model="deck.schematics[tag]"
							list="blueprint-images"
							maxlength="1000"
					/></label>
				</div>
				<img
					v-if="deck.schematics.public || deck.schematics.crew"
					class="gm-blueprint-preview"
					:src="deck.schematics.public || deck.schematics.crew"
					:alt="deck.name"
				/>
				<details>
					<summary>Room hotspots ({{ deck.hotspots.length }})</summary>
					<div v-for="(spot, spotIndex) in deck.hotspots" :key="spotIndex" class="gm-fields">
						<label
							>Room ID<input
								v-model="spot.room"
								required
								pattern="[a-z0-9-]{1,64}"
								list="blueprint-rooms" /></label
						><label
							>Shape<select v-model="spot.shape">
								<option>rect</option>
								<option>circle</option>
							</select></label
						><label
							>Coordinates<input
								v-model="spot.coords"
								required
								placeholder="x1,y1,x2,y2 or x,y,radius" /></label
						><button
							class="term-btn quiet"
							type="button"
							@click="deck.hotspots.splice(spotIndex, 1)"
						>
							Remove hotspot
						</button>
					</div>
					<button
						class="term-btn quiet"
						type="button"
						@click="deck.hotspots.push({ room: '', shape: 'rect', coords: '' })"
					>
						Add hotspot
					</button>
				</details>
				<button class="term-btn quiet" type="button" @click="draft.decks.splice(index, 1)">
					Remove deck
				</button>
			</article>
			<button class="term-btn quiet" type="button" @click="addDeck">Add deck</button>
			<h3>Rooms</h3>
			<datalist id="blueprint-rooms">
				<option v-for="(room, id) in draft.rooms" :key="id" :value="id" />
			</datalist>
			<details v-for="(room, id) in draft.rooms" :key="id" class="panel">
				<summary>{{ room.name }} · {{ id }}</summary>
				<div class="gm-fields">
					<label>Room name<input v-model="room.name" maxlength="200" required /></label
					><label
						>Required clearance<select v-model="room.requires" multiple>
							<option v-for="tag in tags" :key="tag">{{ tag }}</option>
						</select></label
					><label v-for="tag in tags" :key="tag"
						>{{ tag }} detail<textarea
							v-model="room.text[tag]"
							maxlength="4000"
							rows="2"
						></textarea>
					</label>
				</div>
			</details>
			<div class="gm-row">
				<label
					>New room ID<input
						v-model="roomId"
						placeholder="bridge"
						pattern="[a-z0-9-]{1,64}" /></label
				><button class="term-btn quiet" type="button" @click="addRoom">Add room</button>
			</div>
			<button class="term-btn" type="submit">Save blueprints</button>
		</form>
	</section>
</template>
