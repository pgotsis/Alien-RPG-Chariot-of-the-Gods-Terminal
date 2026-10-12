<script setup>
import { computed, inject } from "vue";
import { accountById } from "../lib/access.js";
import AvatarMark from "./AvatarMark.vue";
import MastHead from "./MastHead.vue";

const terminal = inject("terminal");

const listed = computed(function () {
	return (terminal.state.ship.accounts || [])
		.filter((account) => account.listed)
		.slice()
		.sort((a, b) => a.name.localeCompare(b.name));
});

function statusClass(status) {
	return "status-" + String(status || "").toLowerCase().replace(/\s+/g, "-");
}

const hasPublic = computed(() => Boolean(accountById(terminal.state.ship, "public")));
</script>

<template>
	<MastHead />
	<p class="hint">Select a crew record, then enter the access code.</p>
	<p v-if="terminal.state.loginError" class="error" role="alert">{{ terminal.state.loginError }}</p>
	<div class="roster">
		<button
			v-for="account in listed"
			:key="account.id"
			class="roster-item"
			type="button"
			@click="terminal.selectCrew(account)"
		>
			<AvatarMark :account="account" />
			<span>
				{{ account.name }}
				<span class="job">{{ account.job || "" }}</span>
				<span :class="statusClass(account.status)">{{ account.status || "" }}</span>
			</span>
		</button>
	</div>
	<div class="actions">
		<button v-if="hasPublic" class="term-btn" type="button" @click="terminal.publicAccess">Public access</button>
		<button class="term-btn" type="button" @click="terminal.otherCredentials">Other credentials</button>
	</div>
	<p>
		<button class="term-btn quiet" type="button" @click="terminal.resetStation">Reset this station</button>
	</p>
</template>
