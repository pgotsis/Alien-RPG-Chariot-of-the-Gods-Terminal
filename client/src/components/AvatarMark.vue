<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
	account: { type: Object, default: null },
	large: { type: Boolean, default: false }
});

const broken = ref(false);

watch(() => props.account && props.account.photo, function () {
	broken.value = false;
});

const mark = computed(function () {
	const name = props.account ? props.account.name : "";
	const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
});

const photo = computed(() => props.account && props.account.photo && !broken.value);
</script>

<template>
	<span class="avatar" :class="{ lg: large }">
		<img v-if="photo" alt="" :src="account.photo" @error="broken = true" />
		<template v-else>{{ mark }}</template>
	</span>
</template>
