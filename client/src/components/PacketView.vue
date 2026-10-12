<script setup>
import { inject } from "vue";
import { expandClearance, entryVisible } from "../lib/access.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

function tags() {
	const packet = terminal.state.packet;
	if (!packet || !terminal.state.account) return [];
	return expandClearance(packet, terminal.state.account.clearance || []);
}
</script>

<template>
	<ScreenBar :title="terminal.state.packet.name || 'Company packet'" @home="terminal.home" />
	<p class="hint">This table's copy. Another table's status is not on this terminal.</p>
	<h2>Status</h2>
	<article v-for="system in terminal.state.packet.systems || []" :key="system.id" class="system panel">
		<h3>{{ system.name || system.id }}</h3>
		<p class="state">{{ system.state || "" }}</p>
		<div v-if="system.detail && system.detail.company"><LinesText :text="system.detail.company" /></div>
	</article>
	<h2>Roster</h2>
	<ul class="log-list">
		<li v-for="account in terminal.state.packet.accounts || []" :key="account.id">
			{{ account.name }}
			<small>{{ account.job || "" }}  {{ account.status || "" }}</small>
		</li>
	</ul>
	<h2>Logs</h2>
	<ul class="log-list">
		<li v-for="entry in (terminal.state.packet.logs || []).filter((item) => entryVisible(item, tags()))" :key="entry.id">
			<small>{{ entry.time || "" }}</small>
			{{ entry.text || "" }}
		</li>
	</ul>
	<h2>Mail</h2>
	<article v-for="message in terminal.state.packet.mail || []" :key="message.id" class="panel">
		<h3>{{ message.subject || "" }}</h3>
		<p class="meta">{{ message.time || "" }}</p>
		<div><LinesText :text="message.body || ''" /></div>
	</article>
	<h2>Notes</h2>
	<article v-for="note in terminal.state.packet.notes || []" :key="note.id" class="panel">
		<h3>{{ note.title || "Note" }}</h3>
		<div><LinesText :text="note.body || ''" /></div>
	</article>
</template>
