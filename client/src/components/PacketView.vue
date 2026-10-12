<script setup>
import { inject } from "vue";
import { expandClearance, entryVisible, schematicFor, resolveLayer } from "../lib/access.js";
import LinesText from "./LinesText.vue";
import StarMapPlot from "./StarMapPlot.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

function tags() {
	const packet = terminal.state.packet;
	if (!packet || !terminal.state.account) return [];
	return expandClearance(packet, terminal.state.account.clearance || []);
}
</script>

<template>
	<ScreenBar :title="terminal.state.packet.name || 'Company remote AI'" @home="terminal.home" />
	<p class="hint">
		Company-level remote AI access. This does not register you here. Private personal mail, notes
		and files are excluded.
	</p>
	<p class="subhead">{{ terminal.state.packet.computer }} · Company clearance</p>
	<h2>Status</h2>
	<article
		v-for="system in terminal.state.packet.systems || []"
		:key="system.id"
		class="system panel"
	>
		<h3>{{ system.name || system.id }}</h3>
		<p class="state">{{ system.state || "" }}</p>
		<div v-if="system.detail">
			<LinesText :text="resolveLayer(system.detail, tags())" />
		</div>
	</article>
	<h2>Roster</h2>
	<ul class="log-list">
		<li v-for="account in terminal.state.packet.accounts || []" :key="account.id">
			{{ account.name }}
			<small>{{ account.job || "" }} {{ account.status || "" }}</small>
		</li>
	</ul>
	<h2>Logs</h2>
	<ul class="log-list">
		<li
			v-for="entry in (terminal.state.packet.logs || []).filter((item) =>
				entryVisible(item, tags()),
			)"
			:key="entry.id"
		>
			<small>{{ entry.time || "" }}</small>
			{{ entry.text || "" }}
		</li>
	</ul>
	<h2>Mail</h2>
	<article v-for="message in terminal.state.packet.mail || []" :key="message.id" class="panel">
		<h3>{{ message.subject || "" }}</h3>
		<p class="meta">{{ message.time || "" }}</p>
		<div><LinesText :text="message.body || ''" /></div>
	</article>
	<h2>Notes</h2>
	<article v-for="note in terminal.state.packet.notes || []" :key="note.id" class="panel">
		<h3>{{ note.title || "Note" }}</h3>
		<div><LinesText :text="note.body || ''" /></div>
	</article>
	<h2>Blueprints</h2>
	<img
		v-if="schematicFor(terminal.state.packet.overview, 'company')"
		class="overview"
		:src="schematicFor(terminal.state.packet.overview, 'company')"
		alt="Facility overview"
	/>
	<details v-for="deck in terminal.state.packet.decks || []" :key="deck.id" class="panel">
		<summary>{{ deck.name }}</summary>
		<img
			class="gm-blueprint-preview"
			:src="schematicFor(deck.schematics, 'company')"
			:alt="deck.name"
		/>
		<div
			v-for="roomId in [...new Set((deck.hotspots || []).map((spot) => spot.room))]"
			:key="roomId"
		>
			<h3>{{ terminal.state.packet.rooms[roomId]?.name || roomId }}</h3>
			<LinesText :text="resolveLayer(terminal.state.packet.rooms[roomId]?.text, tags())" />
		</div>
	</details>
	<h2>Star map</h2>
	<StarMapPlot
		v-if="terminal.state.packet.starMap"
		:map="terminal.state.packet.starMap"
		:ship-name="terminal.state.packet.name"
	/>
	<h2>Public files</h2>
	<article v-for="file in terminal.state.packet.files || []" :key="file.id" class="panel">
		<h3>{{ file.title }}</h3>
		<LinesText :text="file.body || file.text || ''" />
	</article>
</template>
