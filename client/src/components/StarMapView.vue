<script setup>
import { computed, inject } from "vue";
import ScreenBar from "./ScreenBar.vue";
import StarMapPlot from "./StarMapPlot.vue";
const terminal = inject("terminal");
const allowed = computed(() =>
	terminal.state.grants.viewClearance.some((tag) => ["command", "company"].includes(tag)),
);
</script>
<template>
	<ScreenBar title="Star map" @home="terminal.home" />
	<section v-if="allowed && terminal.state.ship.starMap" class="panel">
		<h2>{{ terminal.state.ship.starMap.position.name }}</h2>
		<p class="meta">
			Navigation plot · schematic coordinates ·
			{{ terminal.state.ship.starMap.updatedAt || "Position not confirmed" }}
		</p>
		<StarMapPlot :map="terminal.state.ship.starMap" :ship-name="terminal.state.ship.name" />
		<p>{{ terminal.state.ship.starMap.notes }}</p>
	</section>
	<p v-else class="hint">Command or company clearance required.</p>
</template>
