<script setup>
import { inject } from "vue";

const terminal = inject("terminal");
defineProps({
	entry: { type: Object, required: true }
});
</script>

<template>
	<div>
		<div class="code-row">
			<input
				type="text"
				maxlength="24"
				aria-label="Unlock code"
				:value="terminal.state.fileCode"
				@input="terminal.state.fileCode = $event.target.value"
			/>
			<button class="term-btn" type="button" @click="terminal.unlockEntry(entry)">Unlock</button>
		</div>
		<p v-if="terminal.state.fileError" class="error" role="alert">{{ terminal.state.fileError }}</p>
	</div>
</template>
