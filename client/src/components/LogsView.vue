<script setup>
import { computed, inject } from "vue";
import { entryVisible } from "../lib/access.js";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

const rows = computed(() => (
	(terminal.state.ship.logs || []).filter((entry) => entryVisible(entry, terminal.state.grants.viewClearance))
));
</script>

<template>
	<ScreenBar title="Logs" @home="terminal.home" />
	<ul class="log-list">
		<li v-if="!rows.length">No log entries for this access level.</li>
		<li v-for="entry in rows" :key="entry.id">
			<small>{{ entry.time || "" }}</small>
			{{ entry.text || "" }}
		</li>
	</ul>
</template>
