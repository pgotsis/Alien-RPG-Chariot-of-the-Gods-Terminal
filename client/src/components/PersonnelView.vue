<script setup>
import { computed, inject } from "vue";
import { statusClass } from "../person.js";
import AvatarMark from "./AvatarMark.vue";
import ScreenBar from "./ScreenBar.vue";

const terminal = inject("terminal");

const people = computed(() => (
	(terminal.state.ship.accounts || [])
		.filter((account) => account.listed)
		.slice()
		.sort((a, b) => a.name.localeCompare(b.name))
));

const showClassified = computed(() => (
	terminal.state.grants.rosterDetail && people.value.some((account) => account.classifiedStatus)
));
</script>

<template>
	<ScreenBar title="Personnel" @home="terminal.home" />
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Position</th>
					<th>Last login</th>
					<th>Status</th>
					<th v-if="showClassified">Restricted</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="account in people" :key="account.id">
					<td>
						<div class="crew-cell">
							<AvatarMark :account="account" />
							{{ account.name }}
						</div>
					</td>
					<td>{{ account.job || "" }}</td>
					<td>{{ account.lastLogin || "" }}</td>
					<td :class="statusClass(account.status)">{{ account.status || "" }}</td>
					<td v-if="showClassified">{{ account.classifiedStatus || "" }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
