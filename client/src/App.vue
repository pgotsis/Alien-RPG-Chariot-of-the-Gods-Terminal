<script setup>
import { onMounted, onUnmounted, provide } from "vue";
import GmView from "./components/GmView.vue";
import LoginView from "./components/LoginView.vue";
import MastHead from "./components/MastHead.vue";
import PublicView from "./components/PublicView.vue";
import ShellView from "./components/ShellView.vue";
import StandbyView from "./components/StandbyView.vue";
import { createTerminal } from "./terminal.js";

const terminal = createTerminal();
provide("terminal", terminal);

onMounted(() => terminal.start());
onUnmounted(() => terminal.stop());
</script>

<template>
	<div class="terminal">
		<p v-if="terminal.state.mode === 'loading'" class="subhead">Loading terminal…</p>
		<StandbyView v-else-if="terminal.state.mode === 'standby'" />
		<GmView v-else-if="terminal.state.mode === 'gm'" />
		<template v-else-if="terminal.state.mode === 'error'">
			<MastHead />
			<p class="error">{{ terminal.state.loginError }}</p>
		</template>
		<PublicView v-else-if="terminal.state.mode === 'public'" />
		<LoginView v-else-if="terminal.state.mode === 'login'" />
		<ShellView v-else />
	</div>
</template>
