<script setup>
import { computed, inject } from "vue";
import { accessLabel } from "../lib/access.js";

const terminal = inject("terminal");
const props = defineProps({
	chip: { type: Boolean, default: false }
});

const ship = computed(() => terminal.state.ship || {});

const label = computed(() => (props.chip && terminal.state.account ? accessLabel(terminal.state.account) : ""));

const accessColor = computed(function () {
	const colors = {
		security: "var(--SecurityColor)",
		command: "var(--CommandColor)",
		research: "var(--ResearchColor)",
		company: "var(--CompanyColor)",
		visitor: "var(--CompanyColor)"
	};
	return colors[label.value] || "var(--AGreen)";
});
</script>

<template>
	<div class="mast">
		<div>
			<h1>{{ ship.computer || "MU/TH/UR" }}</h1>
			<p class="subhead">
				{{ ship.name || "Ship terminal" }}<template v-if="ship.date">  ·  {{ ship.date }}</template>
			</p>
		</div>
		<img v-if="ship.logo && !chip" class="wordmark" alt="" :src="ship.logo" />
		<div v-if="chip && terminal.state.account" class="userchip" :style="{ '--access': accessColor }">
			<strong>{{ terminal.state.account.name }}</strong>
			<span>{{ terminal.state.account.job || "" }}</span>
			<span>Access: {{ label }}</span>
			<span v-if="terminal.state.account.homeShip">{{ terminal.state.account.homeShip }}</span>
		</div>
	</div>
</template>
