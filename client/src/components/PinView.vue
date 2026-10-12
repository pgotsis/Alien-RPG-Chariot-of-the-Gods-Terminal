<script setup>
import { computed, inject } from "vue";
import { accountById } from "../lib/access.js";
import AvatarMark from "./AvatarMark.vue";
import MastHead from "./MastHead.vue";

const terminal = inject("terminal");
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const account = computed(() => (
	terminal.state.unlisted ? null : accountById(terminal.state.ship, terminal.state.pendingId)
));

const dots = computed(() => terminal.state.pin.replace(/./g, "•") || " ");
</script>

<template>
	<MastHead />
	<div class="who">
		<template v-if="account">
			<AvatarMark :account="account" large />
			<div>
				<h2>{{ account.name }}</h2>
				<p class="job">{{ account.job || "" }}</p>
				<p v-if="!account.pinHash" class="error">No access card on file</p>
			</div>
		</template>
		<h2 v-else>Unlisted credentials</h2>
	</div>
	<div class="pin-dots" aria-label="Access code">{{ dots }}</div>
	<p v-if="terminal.state.loginError" class="error" role="alert">{{ terminal.state.loginError }}</p>
	<div class="keypad">
		<button v-for="digit in digits" :key="digit" class="key" type="button" @click="terminal.pushPin(digit)">{{ digit }}</button>
		<button class="key" type="button" @click="terminal.clearPin">Clr</button>
		<button class="key" type="button" @click="terminal.pushPin('0')">0</button>
		<button class="key" type="button" @click="terminal.submitPin">Ok</button>
	</div>
	<button class="term-btn quiet" type="button" @click="terminal.backToLogin">Back</button>
</template>
