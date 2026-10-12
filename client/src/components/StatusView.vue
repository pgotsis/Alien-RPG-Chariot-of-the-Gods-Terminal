<script setup>
import { computed, inject } from "vue";
import { resolveLayer, systemVisible } from "../lib/access.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

const systems = computed(() => (
	(terminal.state.ship.systems || []).filter((system) => (
		systemVisible(system, terminal.state.grants.viewClearance)
	))
));

function detail(system) {
	return resolveLayer(system.detail, terminal.state.grants.viewClearance);
}

function levelClass(system) {
	return "level-" + String(system.level || "NOTICE").toLowerCase();
}
</script>

<template>
	<ScreenBar title="Ship status" @home="terminal.home" />
	<article
		v-for="system in systems"
		:key="system.id"
		class="system panel"
		:class="levelClass(system)"
	>
		<div class="system-head">
			<h3>{{ system.name || system.id }}</h3>
			<span class="level-tag">{{ system.level || "NOTICE" }}</span>
		</div>
		<p class="state">{{ system.state || "" }}</p>
		<div v-if="detail(system)"><LinesText :text="detail(system)" /></div>
	</article>
	<p v-if="!systems.length" class="hint">No status lines for this access level.</p>
</template>
