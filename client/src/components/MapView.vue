<script setup>
import { computed, inject, nextTick, ref, watch } from "vue";
import { resolveLayer, roomAllowed, schematicFor } from "../lib/access.js";
import { hotspotBox } from "../person.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");
const panel = ref(null);

const decks = computed(() => terminal.state.ship.decks || []);
const deck = computed(() => decks.value.find((item) => item.id === terminal.state.deckId) || decks.value[0] || null);

watch(decks, function (list) {
	if (!terminal.state.deckId && list[0]) terminal.state.deckId = list[0].id;
}, { immediate: true });

const overviewSrc = computed(() => (
	schematicFor(terminal.state.ship.overview, terminal.state.grants.schematic, terminal.state.ship.schematicOrder)
));

const deckSrc = computed(() => (
	deck.value
		? schematicFor(deck.value.schematics, terminal.state.grants.schematic, terminal.state.ship.schematicOrder)
		: ""
));

const room = computed(() => {
	const id = terminal.state.roomId;
	if (!id) return null;
	return (terminal.state.ship.rooms && terminal.state.ship.rooms[id]) || { name: id };
});

const roomBody = computed(() => {
	if (!room.value) return "";
	const view = terminal.state.grants.viewClearance;
	const allowed = roomAllowed(room.value, view);
	if (!allowed) return "Access denied.";
	return resolveLayer(room.value.text, view) || "No further data.";
});

watch(() => terminal.state.roomId, async function (id) {
	if (!id) return;
	await nextTick();
	if (window.matchMedia("(max-width: 800px)").matches && panel.value) {
		panel.value.scrollIntoView({ block: "nearest" });
	}
});

function chooseDeck(id) {
	terminal.state.deckId = id;
	terminal.state.showOverview = false;
	terminal.state.roomId = null;
}

function chooseRoom(spot) {
	terminal.play("sound2.wav");
	terminal.state.roomId = spot.room;
}

function roomName(id) {
	const record = (terminal.state.ship.rooms && terminal.state.ship.rooms[id]) || {};
	return record.name || id;
}
</script>

<template>
	<ScreenBar title="Schematic" @home="terminal.home" />
	<div class="deck-row">
		<button
			v-for="item in decks"
			:key="item.id"
			class="term-btn"
			:class="{ on: !terminal.state.showOverview && item.id === terminal.state.deckId }"
			type="button"
			@click="chooseDeck(item.id)"
		>{{ item.name || item.id }}</button>
		<button
			v-if="terminal.state.ship.overview"
			class="term-btn"
			:class="{ on: terminal.state.showOverview }"
			type="button"
			@click="terminal.state.showOverview = true"
		>Overview</button>
	</div>
	<img v-if="terminal.state.showOverview" class="overview" alt="Ship overview" :src="overviewSrc" />
	<div v-else-if="deck" class="map-layout">
		<div class="deck-frame">
			<img class="deck" :alt="deck.name || 'Deck'" :src="deckSrc" />
			<button
				v-for="(spot, index) in deck.hotspots || []"
				:key="spot.room + '-' + index"
				class="hotspot"
				:class="{ on: terminal.state.roomId === spot.room }"
				type="button"
				:style="hotspotBox(spot, deck)"
				:aria-label="roomName(spot.room)"
				@click="chooseRoom(spot)"
			></button>
		</div>
		<div ref="panel" class="panel">
			<p v-if="!room" class="hint">Select a compartment.</p>
			<template v-else>
				<h3>{{ room.name || terminal.state.roomId }}</h3>
				<div><LinesText :text="roomBody" /></div>
			</template>
		</div>
	</div>
</template>
