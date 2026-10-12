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
	<button
		v-if="terminal.unseen('announcements')"
		class="term-btn alert"
		type="button"
		@click="terminal.home()"
	>New transmission</button>
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
			:class="{ alert: terminal.unseen(mod.id) }"
			type="button"
			@click="terminal.openModule(mod.id)"
		>{{ mod.label || mod.id }}</button>
		<button
			v-if="terminal.state.packet && terminal.state.account.override"
			class="term-btn"
			:class="{ alert: terminal.unseen('packet') }"
			type="button"
			@click="terminal.openModule('packet')"
		>{{ terminal.state.packet.name }}</button>
	</div>
	<form v-if="terminal.state.account && terminal.state.account.override && !terminal.state.packet" class="panel compose" @submit.prevent="terminal.submitOverride">
		<h2>Company override</h2>
		<p class="hint">Eight digits. Opens the configured AI at company clearance, without crew registration or private mail, notes or files.</p>
		<input v-model="terminal.state.overrideCode" inputmode="numeric" maxlength="8" autocomplete="off" />
		<p v-if="terminal.state.overrideError" class="error">{{ terminal.state.overrideError }}</p>
		<button class="term-btn" type="submit">Submit code</button>
	</form>
	<div class="actions">
		<button class="term-btn quiet" type="button" @click="terminal.logout">Log out</button>
	</div>
</template>
