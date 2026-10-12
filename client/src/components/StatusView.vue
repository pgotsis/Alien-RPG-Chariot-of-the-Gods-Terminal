<script setup>
import { inject } from "vue";
import { resolveLayer } from "../lib/access.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

function detail(system) {
	return resolveLayer(system.detail, terminal.state.grants.viewClearance);
}
</script>

<template>
	<ScreenBar title="Ship status" @home="terminal.home" />
	<article v-for="system in terminal.state.ship.systems || []" :key="system.id" class="system panel">
		<h3>{{ system.name || system.id }}</h3>
		<p class="state">{{ system.state || "" }}</p>
		<div v-if="detail(system)"><LinesText :text="detail(system)" /></div>
	</article>
</template>
