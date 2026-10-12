<script setup>
defineProps({
	title: { type: String, required: true }
});
const emit = defineEmits(["home"]);
</script>

<template>
	<div class="screen-title">
		<h2>{{ title }}</h2>
		<button class="term-btn" type="button" @click="emit('home')">Main menu</button>
	</div>
</template>
