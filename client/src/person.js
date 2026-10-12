import { accountById } from "./lib/access.js";

export function personName(ship, id) {
	if (!id) return "";
	if (ship.directories && ship.directories[id]) return ship.directories[id];
	const contact = (ship.contacts || []).find(function (item) { return item.id === id; });
	if (contact) return contact.name;
	const account = accountById(ship, id);
	return account ? account.shortName || account.name : id;
}

export function statusClass(status) {
	return "status-" + String(status || "").toLowerCase().replace(/\s+/g, "-");
}

export function hotspotBox(spot, deck) {
	const width = deck.width || 500;
	const height = deck.height || 1000;
	const n = String(spot.coords || "").split(",").map(Number);
	let x;
	let y;
	let w;
	let h;
	if (spot.shape === "circle") {
		x = n[0] - n[2];
		y = n[1] - n[2];
		w = n[2] * 2;
		h = n[2] * 2;
	} else {
		x = n[0];
		y = n[1];
		w = n[2] - n[0];
		h = n[3] - n[1];
	}
	return {
		left: (x / width) * 100 + "%",
		top: (y / height) * 100 + "%",
		width: (w / width) * 100 + "%",
		height: (h / height) * 100 + "%"
	};
}
