<script setup>
import { computed, inject, watch } from "vue";
import FilesView from "./FilesView.vue";
import LogsView from "./LogsView.vue";
import MailView from "./MailView.vue";
import MapView from "./MapView.vue";
import MastHead from "./MastHead.vue";
import NotesView from "./NotesView.vue";
import PacketView from "./PacketView.vue";
import PersonnelView from "./PersonnelView.vue";
import ScreenBar from "./ScreenBar.vue";
import StarMapView from "./StarMapView.vue";
import StatusView from "./StatusView.vue";
import TasksView from "./TasksView.vue";

const terminal = inject("terminal");

const tabs = computed(function () {
	const grants = terminal.state.grants || { modules: [] };
	const modules = (terminal.state.ship.modules || []).filter(function (mod) {
		return grants.modules.indexOf(mod.id) !== -1;
	});
	const list = modules.map(function (mod) {
		return { id: mod.id, label: mod.label || mod.id };
	});
	if (terminal.state.packet && terminal.state.account && terminal.state.account.override) {
		list.push({ id: "packet", label: terminal.state.packet.name || "Company packet" });
	}
	return list;
});



watch(tabs, function (list) {
	if (!list.length) return;
	if (list.some((tab) => tab.id === terminal.state.module)) return;
	terminal.state.module = list[0].id;
}, { immediate: true });
</script>

<template>
	<MastHead chip />
	<nav class="tab-bar" aria-label="Terminal modules">
		<button
			v-for="tab in tabs"
			:key="tab.id"
			class="term-btn"
			:class="{ on: terminal.state.module === tab.id, alert: terminal.unseen(tab.id) }"
			type="button"
			@click="terminal.openModule(tab.id)"
		>{{ tab.label }}</button>
	</nav>

	<MailView v-if="terminal.state.module === 'mail'" />
	<StarMapView v-else-if="terminal.state.module === 'starmap'" />
	<MapView v-else-if="terminal.state.module === 'map'" />
	<PersonnelView v-else-if="terminal.state.module === 'personnel'" />
	<StatusView v-else-if="terminal.state.module === 'status'" />
	<LogsView v-else-if="terminal.state.module === 'logs'" />
	<NotesView v-else-if="terminal.state.module === 'notes'" />
	<PacketView v-else-if="terminal.state.module === 'packet' && terminal.state.packet" />
	<FilesView v-else-if="terminal.state.module === 'files'" />
	<TasksView v-else-if="terminal.state.module === 'tasks'" />
	<template v-else>
		<ScreenBar :title="terminal.state.module" @home="terminal.home" />
		<p>This module is not installed on this terminal.</p>
	</template>

	<form
		v-if="terminal.state.account && terminal.state.account.override && !terminal.state.packet"
		class="panel compose"
		@submit.prevent="terminal.submitOverride"
	>
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
