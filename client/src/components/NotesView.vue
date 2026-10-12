<script setup>
import { computed, inject, ref, watch } from "vue";
import { accountById, notesVisible } from "../lib/access.js";
import LinesText from "./LinesText.vue";
import CodeEntry from "./CodeEntry.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");
const draft = ref("");
const focused = ref(false);

const notes = computed(() => notesVisible(terminal.state.ship, terminal.state.account, terminal.state.grants).filter((note) => !note.private));

const open = computed(() => notes.value.find((note) => note.id === terminal.state.openNoteId) || null);

const locked = computed(() => (
	open.value && open.value.codeHash && terminal.state.session.unlocked.indexOf(open.value.id) === -1
));

const stationBody = computed(function () {
	const id = "station-" + terminal.state.account.id;
	const note = (terminal.state.ship.notes || []).find((item) => item.id === id);
	return note ? note.body || "" : "";
});

watch(stationBody, function (value) {
	if (!focused.value) draft.value = value;
}, { immediate: true });

function onDraft() {
	terminal.saveStationNote(draft.value);
}

function ownerName(note) {
	const owner = accountById(terminal.state.ship, note.owner);
	return owner ? owner.name : note.owner;
}
</script>

<template>
	<ScreenBar title="Notes" @home="terminal.home" />
	<div class="split">
		<div class="note-list">
			<p v-if="!notes.length" class="hint">No notes for this access level.</p>
			<button
				v-for="note in notes"
				:key="note.id"
				class="list-btn"
				type="button"
				@click="terminal.state.openNoteId = note.id"
			>
				{{ note.title || "Note" }}
				<small>{{ ownerName(note) }}  {{ note.time || "" }}</small>
			</button>
		</div>
		<div class="panel">
			<p v-if="!open" class="hint">Select a note.</p>
			<template v-else-if="locked">
				<h3>{{ open.title || "Locked" }}</h3>
				<p>A code is required on this station.</p>
				<CodeEntry :entry="open" />
			</template>
			<template v-else>
				<h3>{{ open.title || "" }}</h3>
				<p class="meta">{{ open.time || "" }}</p>
				<div><LinesText :text="open.body || ''" /></div>
			</template>
		</div>
	</div>
	<h2>Station notes</h2>
	<p class="hint">Kept with this person on this table.</p>
	<textarea v-model="draft" class="scratch" @focus="focused = true" @blur="focused = false" @input="onDraft"></textarea>
</template>
