<script setup>
import { inject } from "vue";
import FilesView from "./FilesView.vue";
import HomeView from "./HomeView.vue";
import LogsView from "./LogsView.vue";
import MailView from "./MailView.vue";
import MapView from "./MapView.vue";
import MastHead from "./MastHead.vue";
import NotesView from "./NotesView.vue";
import PacketView from "./PacketView.vue";
import PersonnelView from "./PersonnelView.vue";
import ScreenBar from "./ScreenBar.vue";
import StatusView from "./StatusView.vue";
import TasksView from "./TasksView.vue";

const terminal = inject("terminal");
</script>

<template>
	<MastHead chip />
	<HomeView v-if="terminal.state.module === 'home'" />
	<MailView v-else-if="terminal.state.module === 'mail'" />
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
</template>
