<script setup>
import { computed, inject, watchEffect } from "vue";
import { accountById, mailArchives, messagesFor } from "../lib/access.js";
import { personName } from "../person.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");
const folders = ["inbox", "outbox", "drafts"];

const archives = computed(() => mailArchives(terminal.state.ship, terminal.state.account, terminal.state.grants));

watchEffect(function () {
	const ids = archives.value;
	if (ids.indexOf(terminal.state.archiveId) === -1) {
		terminal.state.archiveId = ids[0] || terminal.state.account.id;
	}
});

const messages = computed(() => (
	messagesFor(terminal.state.ship, terminal.state.archiveId, terminal.state.folder, terminal.state.account, terminal.state.grants)
		.slice()
		.reverse()
));

const open = computed(() => (
	(terminal.state.ship.mail || []).find((message) => message.id === terminal.state.openMailId) || null
));

function count(folder) {
	return messagesFor(terminal.state.ship, terminal.state.archiveId, folder, terminal.state.account, terminal.state.grants).length;
}

function who(message) {
	if (terminal.state.folder === "inbox") return "From " + personName(terminal.state.ship, message.from);
	return "To " + (message.to ? personName(terminal.state.ship, message.to) : "draft");
}

function label(id) {
	const other = accountById(terminal.state.ship, id);
	return other ? other.shortName || other.name : id;
}
</script>

<template>
	<ScreenBar title="Mail" @home="terminal.home" />
	<div v-if="archives.length > 1" class="folder-row">
		<button
			v-for="id in archives"
			:key="id"
			class="term-btn"
			:class="{ on: id === terminal.state.archiveId }"
			type="button"
			@click="terminal.state.archiveId = id; terminal.state.openMailId = null"
		>{{ label(id) }}</button>
	</div>
	<div class="folder-row">
		<button
			v-for="folder in folders"
			:key="folder"
			class="term-btn"
			:class="{ on: terminal.state.folder === folder }"
			type="button"
			@click="terminal.state.folder = folder; terminal.state.openMailId = null"
		>{{ folder }} {{ count(folder) }}</button>
	</div>
	<div class="split">
		<div class="mail-list">
			<p v-if="!messages.length" class="hint">No messages.</p>
			<button
				v-for="message in messages"
				:key="message.id"
				class="mail-item"
				type="button"
				@click="terminal.state.openMailId = message.id"
			>
				{{ message.subject || "(no subject)" }}
				<small>{{ who(message) }}  {{ message.time || "" }}</small>
			</button>
		</div>
		<div class="panel">
			<p v-if="!open" class="hint">Select a message.</p>
			<template v-else>
				<h3>{{ open.subject || "" }}</h3>
				<p class="meta">
					From {{ personName(terminal.state.ship, open.from) }}
					<br />
					To {{ open.to ? personName(terminal.state.ship, open.to) : "draft" }}  {{ open.time || "" }}
				</p>
				<div><LinesText :text="open.body || ''" /></div>
			</template>
		</div>
	</div>
</template>
