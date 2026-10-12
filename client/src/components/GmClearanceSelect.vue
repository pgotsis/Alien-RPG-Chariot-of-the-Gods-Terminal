<script setup>
import { computed, ref } from "vue";
const props = defineProps({ modelValue: { type: Array, default: () => [] }, required: Boolean });
const emit = defineEmits(["update:modelValue"]);
const tags = ["public", "crew", "security", "research", "command", "company"];
const adding = ref(false);
const value = computed(() => props.modelValue.join("|"));
const available = computed(() => tags.filter((tag) => !props.modelValue.includes(tag)));
function choose(event) {
	emit("update:modelValue", event.target.value ? [event.target.value] : []);
}
function add(event) {
	if (!event.target.value) return;
	emit("update:modelValue", [...props.modelValue, event.target.value]);
	adding.value = false;
}
</script>
<template>
	<span class="gm-clearance-select">
		<select :value="value" :required="required" @change="choose">
			<option value="" :disabled="required">
				{{ required ? "Select clearance" : "Any clearance" }}
			</option>
			<option v-if="modelValue.length > 1" :value="value">{{ modelValue.join(", ") }}</option>
			<option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
		</select>
		<button
			v-if="available.length"
			class="term-btn quiet gm-add-clearance"
			type="button"
			:aria-expanded="adding"
			aria-label="Add another clearance"
			title="Add another clearance"
			@click="adding = !adding"
		>
			+
		</button>
		<select
			v-if="adding"
			class="gm-extra-clearance"
			value=""
			aria-label="Additional clearance"
			@change="add"
		>
			<option value="" disabled>Add clearance</option>
			<option v-for="tag in available" :key="tag" :value="tag">{{ tag }}</option>
		</select>
	</span>
</template>
