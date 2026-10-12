<script setup>
import { computed, inject } from "vue";
import { accountById } from "../lib/access.js";
import AvatarMark from "./AvatarMark.vue";
import MastHead from "./MastHead.vue";

const terminal = inject("terminal");
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const people = computed(function () {
	return (terminal.state.ship.accounts || [])
		.filter(function (account) {
			if (account.id === "public" || account.external) return false;
			if (!(account.pinHash || (account.pinHashes && account.pinHashes.length))) return false;
			return account.listed !== false || account.transferred;
		})
		.slice()
		.sort(function (a, b) { return a.name.localeCompare(b.name); });
});

const selected = computed(function () {
	if (terminal.state.unlisted) return null;
	return accountById(terminal.state.ship, terminal.state.pendingId) || people.value[0] || null;
});

const index = computed(function () {
	if (!selected.value) return -1;
	return people.value.findIndex(function (account) { return account.id === selected.value.id; });
});

const dots = computed(() => terminal.state.pin.replace(/./g, "•") || " ");

function showPerson(account) {
	terminal.selectCrew(account);
}

function step(delta) {
	if (!people.value.length) return;
	const current = index.value < 0 ? 0 : index.value;
	const next = (current + delta + people.value.length) % people.value.length;
	showPerson(people.value[next]);
}
</script>

<template>
	<MastHead />
	<div class="login-layout">
		<section class="rolodex">
			<template v-if="!terminal.state.unlisted && selected">
				<AvatarMark :account="selected" large />
				<h2>{{ selected.name }}</h2>
				<p class="job">{{ selected.job || "" }}</p>
				<p v-if="selected.status" class="meta">{{ selected.status }}</p>
				<div class="rolodex-nav">
					<button class="term-btn" type="button" :disabled="people.length < 2" @click="step(-1)">Prev</button>
					<span class="meta">{{ index + 1 }} / {{ people.length || 1 }}</span>
					<button class="term-btn" type="button" :disabled="people.length < 2" @click="step(1)">Next</button>
				</div>
			</template>
			<template v-else>
				<h2>Unlisted credentials</h2>
				<p class="hint">Enter an access code that is not tied to a listed crew record.</p>
			</template>
		</section>

		<section class="pin-panel">
			<p class="hint">{{ terminal.state.unlisted ? "Enter access code" : "Enter access code for this person" }}</p>
			<div class="pin-dots" aria-label="Access code">{{ dots }}</div>
			<p v-if="terminal.state.loginError" class="error" role="alert">{{ terminal.state.loginError }}</p>
			<div class="keypad">
				<button v-for="digit in digits" :key="digit" class="key" type="button" @click="terminal.pushPin(digit)">{{ digit }}</button>
				<button class="key" type="button" @click="terminal.clearPin">Clr</button>
				<button class="key" type="button" @click="terminal.pushPin('0')">0</button>
				<button class="key" type="button" @click="terminal.submitPin">Ok</button>
			</div>
			<div class="actions">
				<button
					v-if="!terminal.state.unlisted"
					class="term-btn quiet"
					type="button"
					@click="terminal.otherCredentials"
				>Other credentials</button>
				<button
					v-else
					class="term-btn quiet"
					type="button"
					@click="terminal.backToLogin"
				>Back to roster</button>
				<button class="term-btn quiet" type="button" @click="terminal.backToPublic">Cancel</button>
			</div>
		</section>
	</div>
</template>
