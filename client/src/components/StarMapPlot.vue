<script setup>
import { computed, ref, useId } from "vue";
const props = defineProps({ map: Object, shipName: String, editable: Boolean });
const emit = defineEmits(["view-change"]);
const clipId = useId();
const drag = ref(null);
const view = computed(() => props.map.backgroundView || { zoom: 1, x: 0, y: 0 });
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}
function point(event) {
	const rect = event.currentTarget.getBoundingClientRect();
	return {
		x: ((event.clientX - rect.left) / rect.width) * 124 - 12,
		y: ((event.clientY - rect.top) / rect.height) * 124 - 12,
	};
}
function start(event) {
	if (!props.editable || !props.map.background || event.button !== 0) return;
	drag.value = { id: event.pointerId, point: point(event), view: { ...view.value } };
	event.currentTarget.setPointerCapture(event.pointerId);
}
function move(event) {
	if (!drag.value || drag.value.id !== event.pointerId) return;
	const here = point(event);
	emit("view-change", {
		...drag.value.view,
		x: clamp(drag.value.view.x + here.x - drag.value.point.x, -800, 800),
		y: clamp(drag.value.view.y + here.y - drag.value.point.y, -800, 800),
	});
}
function stop() {
	drag.value = null;
}
function zoom(event) {
	if (!props.editable || !props.map.background) return;
	event.preventDefault();
	const here = point(event);
	const next = clamp(view.value.zoom * Math.exp(-event.deltaY * 0.002), 1, 8);
	emit("view-change", {
		zoom: next,
		x: clamp(here.x - ((here.x - view.value.x) * next) / view.value.zoom, -800, 800),
		y: clamp(here.y - ((here.y - view.value.y) * next) / view.value.zoom, -800, 800),
	});
}
</script>
<template>
	<svg
		class="star-map"
		:class="{ 'star-map-editable': editable && map.background, dragging: drag }"
		@pointerdown="start"
		@pointermove="move"
		@pointerup="stop"
		@pointercancel="stop"
		@lostpointercapture="stop"
		@wheel="zoom"
		viewBox="-12 -12 124 124"
		role="img"
		:aria-label="'Star map showing ' + shipName + ' at ' + map.position.name"
	>
		<title>{{ shipName }} · {{ map.position.name }}</title>
		<defs>
			<clipPath :id="clipId"><rect x="0" y="0" width="100" height="100" /></clipPath>
		</defs>
		<g :clip-path="`url(#${clipId})`">
			<g :transform="`translate(${view.x} ${view.y}) scale(${view.zoom})`">
				<image
					v-if="map.background"
					:href="map.background"
					x="0"
					y="0"
					width="100"
					height="100"
					:opacity="map.backgroundOpacity ?? 0.7"
					:preserveAspectRatio="map.backgroundFit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'"
				/>
			</g>
		</g>
		<g v-if="map.showGrid !== false">
			<path
				v-for="n in 11"
				:key="n"
				:d="`M ${(n - 1) * 10} 0 V 100 M 0 ${(n - 1) * 10} H 100`"
				class="star-grid"
			/>
		</g>
		<g v-for="(point, index) in map.locations" :key="index">
			<circle :cx="point.x" :cy="100 - point.y" r="1" />
			<text :x="point.x + 2" :y="100 - point.y - 2">{{ point.name }}</text>
		</g>
		<g class="ship-position">
			<circle :cx="map.position.x" :cy="100 - map.position.y" r="2" />
			<path
				:d="`M ${map.position.x - 4} ${100 - map.position.y} h 8 M ${map.position.x} ${96 - map.position.y} v 8`"
			/>
			<text :x="map.position.x + 3" :y="105 - map.position.y">{{ shipName }}</text>
		</g>
	</svg>
</template>
