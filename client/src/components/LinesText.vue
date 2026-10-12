<script setup>
import { computed } from "vue";

const props = defineProps({
	text: { type: String, default: "" }
});

const rows = computed(() => String(props.text || "").split("\n"));
</script>

<template>
	<template v-for="(line, index) in rows" :key="index">
		<br v-if="index" />
		{{ line }}
	</template>
</template>
