<script setup>
import { ref } from "vue";
import QRCode from "qrcode";
const props = defineProps({ link: String, title: String, account: Object, facility: String });
const dialog = ref(null);
const qr = ref("");
const badge = ref(false);
const error = ref("");
async function open(card = false) {
	badge.value = card;
	error.value = "";
	try {
		qr.value = await QRCode.toString(props.link, {
			type: "svg",
			errorCorrectionLevel: "M",
			margin: 4,
			width: 420,
		});
		dialog.value.showModal();
	} catch {
		error.value = "The QR code could not be created.";
	}
}
function print() {
	window.print();
}
</script>
<template>
	<span class="gm-link-tools"
		><button class="term-btn quiet" type="button" :disabled="!link" @click="open()">QR</button
		><button
			v-if="account"
			class="term-btn quiet"
			type="button"
			:disabled="!account.pin"
			@click="open(true)"
		>
			Crew badge</button
		><span v-if="error" class="error">{{ error }}</span></span
	>
	<Teleport to="body"
		><dialog ref="dialog" class="qr-modal" @click="$event.target === dialog && dialog.close()">
			<div v-if="badge" class="crew-badge">
				<header>
					<img :src="'images/WeylandYutaniLogoBlack.png'" alt="Weyland-Yutani" /><span
						>PERSONNEL ACCESS CARD<br />{{ facility }}</span
					>
				</header>
				<div class="badge-main">
					<img v-if="account.photo" class="badge-photo" :src="account.photo" :alt="account.name" />
					<div>
						<h2>{{ account.name }}</h2>
						<p>{{ account.job }}</p>
						<p>Clearance: {{ account.clearance.join(", ") }}</p>
						<small>{{ account.id }}</small>
					</div>
					<div class="badge-qr" role="img" aria-label="Crew login QR code" v-html="qr"></div>
				</div>
				<footer>
					<span>ACCESS PIN</span><span class="badge-pin">{{ account.pin }}</span
					><small>AUTHORIZED PERSONNEL</small>
				</footer>
			</div>
			<div v-else class="qr-display">
				<h2>{{ title }}</h2>
				<div role="img" :aria-label="title + ' QR code'" v-html="qr"></div>
				<a :href="link">{{ link }}</a>
			</div>
			<p class="qr-note">
				{{
					account
						? "Anyone with this crew QR or card can sign in as this person. The stripe pattern only obscures casual reading of the PIN."
						: "Scan to open this table."
				}}
			</p>
			<div class="actions">
				<button v-if="badge" class="term-btn" type="button" @click="print">Print badge</button
				><button class="term-btn" type="button" @click="dialog.close()">Close</button>
			</div>
		</dialog></Teleport
	>
</template>
