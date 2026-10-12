<script setup>
import { ref } from "vue";
const props = defineProps({ tableCode: String });
const emit = defineEmits(["uploaded", "busy"]);
const busy = ref(false);
const error = ref("");
async function upload(event) {
	const file = event.target.files[0];
	if (!file) return;
	error.value = "";
	if (
		!["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
		file.size > 2 * 1024 * 1024
	) {
		error.value = "Choose a PNG, JPEG or WebP image up to 2 MB.";
		event.target.value = "";
		return;
	}
	busy.value = true;
	emit("busy", true);
	try {
		const image = await new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
		const response = await fetch(
			"api/gm/tables/" + encodeURIComponent(props.tableCode) + "/images",
			{
				method: "POST",
				headers: {
					Authorization: "Bearer " + (sessionStorage.getItem("muthr-gm-token") || ""),
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ image }),
			},
		);
		const result = await response.json();
		if (!response.ok) throw new Error(result.error || "Upload failed");
		emit("uploaded", result.url);
	} catch (failure) {
		error.value = failure.message || "Image upload failed";
	} finally {
		busy.value = false;
		emit("busy", false);
		event.target.value = "";
	}
}
</script>
<template>
	<span class="gm-image-upload"
		><input
			type="file"
			accept="image/png,image/jpeg,image/webp"
			:disabled="busy"
			aria-label="Upload image"
			@change="upload"
		/><span v-if="busy" role="status">Processing image…</span
		><span v-if="error" class="error" role="alert">{{ error }}</span></span
	>
</template>
