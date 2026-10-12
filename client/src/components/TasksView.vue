<script setup>
import { computed, inject } from "vue";
import { entryVisible } from "../lib/access.js";
import LinesText from "./LinesText.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

const tasks = computed(() => (
	(terminal.state.ship.tasks || []).filter((task) => entryVisible(task, terminal.state.grants.viewClearance))
));

const open = computed(() => tasks.value.find((task) => task.id === terminal.state.openTaskId) || null);

const installed = computed(() => open.value && typeof open.value.procedure === "string" && open.value.procedure !== "");
</script>

<template>
	<ScreenBar title="Tasks" @home="terminal.home" />
	<div class="split">
		<div class="note-list">
			<p v-if="!tasks.length" class="hint">No tasks for this access level.</p>
			<button
				v-for="task in tasks"
				:key="task.id"
				class="list-btn"
				type="button"
				@click="terminal.state.openTaskId = task.id"
			>
				{{ task.title || task.id }}
				<small>{{ task.kind || "task" }}</small>
			</button>
		</div>
		<div class="panel">
			<p v-if="!open" class="hint">Select a task.</p>
			<template v-else>
				<h3>{{ open.title || open.id }}</h3>
				<p class="meta">{{ open.kind || "task" }}</p>
				<div v-if="open.summary"><LinesText :text="open.summary" /></div>
				<p class="hint">
					{{ installed
						? "A procedure is named for this task. This station does not run it yet."
						: "No procedure is installed for this task." }}
				</p>
			</template>
		</div>
	</div>
</template>
