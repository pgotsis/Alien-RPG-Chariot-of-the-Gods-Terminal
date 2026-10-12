<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from "vue";
import AvatarMark from "./AvatarMark.vue";
import { accessLabel } from "../lib/access.js";

const terminal = inject("terminal");
const props = defineProps({
	chip: { type: Boolean, default: false },
});

const now = ref(Date.now());
let timer;
onMounted(() => {
	timer = window.setInterval(() => {
		now.value = Date.now();
	}, 1000);
});
onUnmounted(() => window.clearInterval(timer));
let observedDate = "";
let observedAt = 0;
const displayDate = computed(() => {
	const value = terminal.state.ship?.date;
	if (value !== observedDate) {
		observedDate = value;
		observedAt = Date.now();
	}
	const base = Date.parse(value);
	const date = new Date(Number.isFinite(base) ? base + now.value - observedAt : now.value);
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "UTC",
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
});
const ship = computed(() => terminal.state.ship || {});

const mark = computed(function () {
	const name = String(ship.value.name || "Terminal")
		.replace(/^USCSS\s+/i, "")
		.trim();
	return name.toUpperCase();
});

const markSize = computed(function () {
	const length = Math.max(mark.value.length, 1);
	return Math.min(2.45, 16 / length) + "rem";
});

const label = computed(() =>
	props.chip && terminal.state.account ? accessLabel(terminal.state.account) : "",
);

const accessColor = computed(function () {
	const colors = {
		security: "var(--SecurityColor)",
		command: "var(--CommandColor)",
		research: "var(--ResearchColor)",
		company: "var(--CompanyColor)",
		visitor: "var(--CompanyColor)",
	};
	return colors[label.value] || "var(--AGreen)";
});
</script>

<template>
	<div class="mast">
		<div class="mast-top">
			<div>
				<h1>{{ ship.computer || "MU/TH/UR" }}</h1>
				<p class="subhead">
					{{ ship.name || "Ship terminal" }}<template> · {{ displayDate }}</template>
				</p>
			</div>
			<p v-if="!chip" class="wordmark" :style="{ '--mark': markSize }" aria-hidden="true">
				{{ mark }}
			</p>
			<div
				v-if="chip && terminal.state.account"
				class="userchip"
				:style="{ '--access': accessColor }"
			>
				<AvatarMark :account="terminal.state.account" />
				<div>
					<strong>{{ terminal.state.account.name }}</strong>
					<span>{{ terminal.state.account.job || "" }}</span>
					<span>Access: {{ label }}</span>
					<span v-if="terminal.state.account.homeShip">{{ terminal.state.account.homeShip }}</span>
				</div>
			</div>
		</div>
		<div v-if="(terminal.state.ships || []).length > 1" class="computer-row">
			<button
				v-for="item in terminal.state.ships"
				:key="item.id"
				class="term-btn"
				:class="{ on: terminal.state.ship && item.id === terminal.state.ship.id }"
				type="button"
				@click="terminal.connectShip(item.id)"
			>
				{{ item.computer }}
				<small>{{ item.name }}</small>
			</button>
		</div>
	</div>
</template>
