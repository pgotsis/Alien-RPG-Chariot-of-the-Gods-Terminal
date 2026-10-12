<script setup>
import { computed, inject, ref, watchEffect } from "vue";
import { accountById, mailArchives, messagesFor } from "../lib/access.js";
import { personName } from "../person.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");
const folders = ["inbox", "outbox", "drafts"];
const to = ref("");
const subject = ref("");
const body = ref("");

const archives = computed(() => mailArchives(terminal.state.ship, terminal.state.account, terminal.state.grants));

const recipients = computed(function () {
	const account = terminal.state.account;
	const crew = (terminal.state.ship.accounts || []).filter(function (item) {
		return item.listed && !item.external && item.id !== account.id && item.id !== "public";
	});
	const contacts = terminal.state.ship.contacts || [];
	return contacts.map(function (contact) {
		return { id: contact.id, label: contact.name };
	}).concat(crew.map(function (item) {
		return { id: item.id, label: item.name };
	}));
});

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
	if (other) return other.shortName || other.name;
	const contact = (terminal.state.ship.contacts || []).find((item) => item.id === id);
	return contact ? contact.name : id;
}

async function send() {
	if (!to.value || !subject.value.trim() || !body.value.trim()) return;
	const ok = await terminal.sendMail(to.value, subject.value.trim(), body.value.trim());
	if (!ok) return;
	to.value = "";
	subject.value = "";
	body.value = "";
	terminal.state.folder = "outbox";
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
	<form v-if="terminal.state.archiveId === terminal.state.account.id" class="panel compose" @submit.prevent="send">
		<h2>New message</h2>
		<select v-model="to">
			<option value="">Recipient</option>
			<option v-for="person in recipients" :key="person.id" :value="person.id">{{ person.label }}</option>
		</select>
		<input v-model="subject" type="text" maxlength="200" placeholder="Subject" />
		<textarea v-model="body" class="scratch"></textarea>
		<button class="term-btn" type="submit">Send</button>
	</form>
</template>
