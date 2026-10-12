<script setup>
import { computed, inject } from "vue";
import { entryVisible } from "../lib/access.js";
import CodeEntry from "./CodeEntry.vue";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

const files = computed(() => (
	(terminal.state.ship.files || []).filter((file) => entryVisible(file, terminal.state.grants.viewClearance))
));

const open = computed(() => files.value.find((file) => file.id === terminal.state.openFileId) || null);

function locked(file) {
	return file && file.codeHash && terminal.state.session.unlocked.indexOf(file.id) === -1;
}
</script>

<template>
	<ScreenBar title="Files" @home="terminal.home" />
	<div class="split">
		<div class="note-list">
			<p v-if="!files.length" class="hint">No files for this access level.</p>
			<button
				v-for="file in files"
				:key="file.id"
				class="list-btn"
				type="button"
				@click="terminal.state.openFileId = file.id; terminal.state.fileError = ''"
			>
				{{ file.title || "File" }}
				<small>{{ locked(file) ? "Code required  " : "" }}{{ file.time || "" }}</small>
			</button>
		</div>
		<div class="panel">
			<p v-if="!open" class="hint">Select a file.</p>
			<template v-else-if="locked(open)">
				<h3>{{ open.title || "Locked" }}</h3>
				<p>Enter the code found for this file.</p>
				<CodeEntry :entry="open" />
			</template>
			<template v-else>
				<h3>{{ open.title || "" }}</h3>
				<p class="meta">{{ open.time || "" }}</p>
				<div><LinesText :text="open.body || ''" /></div>
			</template>
		</div>
	</div>
</template>
