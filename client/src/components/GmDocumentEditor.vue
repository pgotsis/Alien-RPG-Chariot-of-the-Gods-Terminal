<script setup>
import { computed, ref, watch } from "vue";
const props = defineProps({ kind: String, entries: Array, ship: Object });
const emit = defineEmits(["patch"]);
const clearances = ["public", "crew", "security", "research", "command", "company"];
const labels = { Log: "Logs", Announcement: "Announcements", Mail: "Mail" };
const rows = ref([]);
const blank = () => ({
	title: "",
	subject: "",
	text: "",
	body: "",
	time: "",
	from: "",
	to: "",
	clearance: [props.kind === "Announcement" ? "public" : "crew"],
});
const entry = ref(blank());
const senders = computed(() => [...(props.ship.contacts || []), ...props.ship.accounts]);
function normalize(item) {
	return { ...JSON.parse(JSON.stringify(item)), clearance: item.clearance || ["crew"] };
}
watch(
	() => props.entries,
	(entries, previous = []) => {
		rows.value = entries.map((item) => {
			const draft = rows.value.find((row) => row.id === item.id);
			const original = previous.find((row) => row.id === item.id);
			return draft && original && JSON.stringify(draft) !== JSON.stringify(normalize(original))
				? draft
				: normalize(item);
		});
	},
	{ immediate: true },
);
watch(
	() => props.ship.id,
	() => {
		rows.value = props.entries.map(normalize);
		entry.value = blank();
	},
);
function save(item, fresh = false) {
	emit(
		"patch",
		{ ["save" + props.kind]: item },
		fresh
			? () => {
					entry.value = blank();
				}
			: undefined,
	);
}
function remove(item) {
	if (window.confirm("Delete this entry?")) emit("patch", { ["delete" + props.kind]: item.id });
}
</script>

<template>
	<section>
		<h2>{{ labels[kind] }} · {{ ship.name }}</h2>
		<p v-if="kind === 'Announcement'" class="hint">
			Announcements are separate from mail. Select public visibility to show an announcement before
			login; crew visibility requires crew access.
		</p>
		<p v-if="kind === 'Mail'" class="hint">
			Includes scenario mail and messages created during play. Public and crew recipients are
			broadcasts; visibility controls which other messages appear in the public feed.
		</p>
		<p class="hint">
			Dates are in the adventure calendar. Existing date formats are preserved; enter a date such as
			2183-11-12 14:30.
		</p>
		<p v-if="!rows.length" class="hint">No entries yet.</p>
		<form
			v-for="item in [...rows, entry]"
			:key="item.id || 'new'"
			class="panel gm-document"
			@submit.prevent="save(item, !item.id)"
		>
			<h3>
				{{ item.id ? item.title || item.subject || "Log entry" : "New " + kind.toLowerCase() }}
			</h3>
			<div class="gm-fields">
				<label v-if="kind === 'Announcement'"
					>Title<input v-model="item.title" required maxlength="200"
				/></label>
				<label v-if="kind === 'Mail'"
					>Subject<input v-model="item.subject" required maxlength="200"
				/></label>
				<label
					>Date and time<input v-model="item.time" placeholder="2183-11-12 14:30" maxlength="200"
				/></label>
				<label
					>Visibility<select v-model="item.clearance" multiple required>
						<option v-for="tag in clearances" :key="tag">{{ tag }}</option>
					</select></label
				>
				<label v-if="kind !== 'Log'"
					>From<select v-model="item.from" :required="kind === 'Mail'">
						<option value="">Unspecified</option>
						<option
							v-if="item.from && !senders.some((sender) => sender.id === item.from)"
							:value="item.from"
						>
							{{ item.from }}
						</option>
						<option v-for="sender in senders" :key="sender.id" :value="sender.id">
							{{ sender.name }}
						</option>
					</select></label
				>
				<label v-if="kind === 'Mail'"
					>To<select v-model="item.to">
						<option value="">Draft</option>
						<option value="public">Public broadcast</option>
						<option value="crew">Crew broadcast</option>
						<option
							v-if="
								item.to &&
								!senders.some((sender) => sender.id === item.to) &&
								!['public', 'crew'].includes(item.to)
							"
							:value="item.to"
						>
							{{ item.to }}
						</option>
						<option v-for="sender in senders" :key="sender.id" :value="sender.id">
							{{ sender.name }}
						</option>
					</select></label
				>
			</div>
			<label
				>Text<textarea
					v-if="kind === 'Log'"
					v-model="item.text"
					rows="3"
					required
					maxlength="4000"
				></textarea
				><textarea v-else v-model="item.body" rows="3" required maxlength="4000"></textarea>
			</label>
			<div class="actions">
				<button class="term-btn" type="submit">{{ item.id ? "Save entry" : "Add entry" }}</button
				><button v-if="item.id" class="term-btn quiet" type="button" @click="remove(item)">
					Delete entry
				</button>
			</div>
		</form>
	</section>
</template>
