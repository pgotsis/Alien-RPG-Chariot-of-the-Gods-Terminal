<script setup>
import { onMounted, onUnmounted, provide } from "vue";
import LoginView from "./components/LoginView.vue";
import MastHead from "./components/MastHead.vue";
import PinView from "./components/PinView.vue";
import ShellView from "./components/ShellView.vue";
import { createTerminal } from "./terminal.js";

const terminal = createTerminal();
provide("terminal", terminal);

onMounted(() => terminal.start());
onUnmounted(() => terminal.stop());
</script>

<template>
	<div class="terminal">
		<p v-if="terminal.state.mode === 'loading'" class="subhead">Loading terminal…</p>
		<template v-else-if="terminal.state.mode === 'error'">
			<MastHead />
			<p class="error">{{ terminal.state.loginError }}</p>
		</template>
		<LoginView v-else-if="terminal.state.mode === 'login'" />
		<PinView v-else-if="terminal.state.mode === 'pin'" />
		<ShellView v-else />
	</div>
</template>
