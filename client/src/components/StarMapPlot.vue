<script setup>
defineProps({ map: Object, shipName: String });
</script>
<template>
	<svg
		class="star-map"
		viewBox="-12 -12 124 124"
		role="img"
		:aria-label="'Star map showing ' + shipName + ' at ' + map.position.name"
	>
		<title>{{ shipName }} · {{ map.position.name }}</title>
		<path
			v-for="n in 11"
			:key="n"
			:d="`M ${(n - 1) * 10} 0 V 100 M 0 ${(n - 1) * 10} H 100`"
			class="star-grid"
		/>
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
