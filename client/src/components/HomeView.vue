<script setup>
import { computed, inject } from "vue";
import { entryVisible } from "../lib/access.js";
import { personName } from "../person.js";
import LinesText from "./LinesText.vue";

const terminal = inject("terminal");

const news = computed(() => (
	(terminal.state.ship.announcements || []).filter((item) => entryVisible(item, terminal.state.grants.viewClearance))
));

const modules = computed(() => (
	(terminal.state.ship.modules || []).filter((mod) => terminal.state.grants.modules.indexOf(mod.id) !== -1)
));
</script>

<template>
	<article v-for="item in news" :key="item.id" class="announce">
		<strong>{{ item.title || "Announcement" }}</strong>
		<div class="meta">{{ item.from ? personName(terminal.state.ship, item.from) + "  " : "" }}{{ item.time || "" }}</div>
		<p><LinesText :text="item.body || ''" /></p>
	</article>
	<div class="module-grid">
		<button
			v-for="mod in modules"
			:key="mod.id"
			class="term-btn"
			type="button"
			@click="terminal.openModule(mod.id)"
		>{{ mod.label || mod.id }}</button>
	</div>
	<div class="actions">
		<button class="term-btn quiet" type="button" @click="terminal.logout">Log out</button>
	</div>
</template>
