<script setup>
import { computed, inject } from "vue";
import { entryVisible, resolveLayer, systemVisible } from "../lib/access.js";
import { personName } from "../person.js";
import LinesText from "./LinesText.vue";
import MastHead from "./MastHead.vue";

const terminal = inject("terminal");

const alerts = computed(() => (
	(terminal.state.ship.systems || []).filter(function (system) {
		if (!systemVisible(system, terminal.state.grants.viewClearance)) return false;
		const level = String(system.level || "NOTICE").toUpperCase();
		return level === "WARNING" || level === "CRITICAL";
	})
));

const messages = computed(function () {
	const grants = terminal.state.grants;
	const news = (terminal.state.ship.announcements || []).filter(function (item) {
		return entryVisible(item, grants.viewClearance);
	}).map(function (item) {
		return {
			id: "a-" + item.id,
			title: item.title || "Announcement",
			meta: (item.from ? personName(terminal.state.ship, item.from) + "  " : "") + (item.time || ""),
			body: item.body || ""
		};
	});
	const mail = (terminal.state.ship.mail || []).filter(function (message) {
		if (!message.to) return false;
		if (message.to === "public" || message.to === "crew") return true;
		return entryVisible(message, grants.viewClearance);
	}).map(function (message) {
		return {
			id: "m-" + message.id,
			title: message.subject || "Message",
			meta: personName(terminal.state.ship, message.from) + "  " + (message.time || ""),
			body: message.body || ""
		};
	});
	return news.concat(mail);
});

function detail(system) {
	return resolveLayer(system.detail, terminal.state.grants.viewClearance);
}

function levelClass(system) {
	return "level-" + String(system.level || "NOTICE").toLowerCase();
}
</script>

<template>
	<MastHead />
	<div class="actions">
		<button class="term-btn" type="button" @click="terminal.openLogin">Login</button>
	</div>
	<div class="public-layout">
		<aside class="public-alerts">
			<h2>Status alerts</h2>
			<p v-if="!alerts.length" class="hint">No public warnings.</p>
			<article
				v-for="system in alerts"
				:key="system.id"
				class="system panel"
				:class="levelClass(system)"
			>
				<div class="system-head">
					<h3>{{ system.name || system.id }}</h3>
					<span class="level-tag">{{ system.level || "NOTICE" }}</span>
				</div>
				<p class="state">{{ system.state || "" }}</p>
				<div v-if="detail(system)"><LinesText :text="detail(system)" /></div>
			</article>
		</aside>
		<section class="public-feed">
			<h2>Messages</h2>
			<p v-if="!messages.length" class="hint">No public transmissions on file.</p>
			<article v-for="item in messages" :key="item.id" class="announce">
				<strong>{{ item.title }}</strong>
				<div class="meta">{{ item.meta }}</div>
				<p><LinesText :text="item.body" /></p>
			</article>
		</section>
	</div>
</template>
