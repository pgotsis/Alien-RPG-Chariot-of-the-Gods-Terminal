// SHA-256, hex encoded. ASCII input only, which covers salts, pins, and unlock codes.
function sha256Hex(str) {
	function rightRotate(value, amount) {
		return (value >>> amount) | (value << (32 - amount));
	}

	const maxWord = Math.pow(2, 32);
	const words = [];
	const hash = [];
	const k = [];
	const isComposite = {};
	let primeCounter = 0;

	for (let candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
			hash[primeCounter] = (Math.pow(candidate, 0.5) * maxWord) | 0;
			k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
		}
	}

	let message = str + "\x80";
	while ((message.length % 64) - 56) message += "\x00";

	for (let i = 0; i < message.length; i++) {
		const code = message.charCodeAt(i);
		words[i >> 2] |= code << ((3 - i) % 4) * 8;
	}
	const bitLength = str.length * 8;
	words[words.length] = ((bitLength / maxWord) | 0);
	words[words.length] = bitLength;

	for (let j = 0; j < words.length;) {
		const w = words.slice(j, (j += 16));
		const oldHash = hash.slice(0);
		for (let i = 0; i < 64; i++) {
			const w15 = w[i - 15];
			const w2 = w[i - 2];
			const a = hash[0];
			const e = hash[4];
			const temp1 =
				(hash[7] +
					(rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
					((e & hash[5]) ^ (~e & hash[6])) +
					k[i] +
					(w[i] =
						i < 16
							? w[i]
							: (w[i - 16] +
									(rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
									w[i - 7] +
									(rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
							  0)) |
				0;
			const temp2 =
				(rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
				((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
			hash.unshift((temp1 + temp2) | 0);
			hash[4] = (hash[4] + temp1) | 0;
			hash.pop();
		}
		for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
	}

	let result = "";
	for (let i = 0; i < 8; i++) {
		for (let shift = 3; shift >= 0; shift--) {
			const b = (hash[i] >> (shift * 8)) & 255;
			result += (b < 16 ? "0" : "") + b.toString(16);
		}
	}
	return result;
}

function pinHash(salt, pin) {
	return sha256Hex(String(salt) + ":" + String(pin).trim().toUpperCase());
}

export { sha256Hex, pinHash };
