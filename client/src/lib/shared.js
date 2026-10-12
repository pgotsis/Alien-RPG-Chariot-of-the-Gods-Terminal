// Live roster status, systems, logs, and announcements. The ship file is the
// scenario. This overlay is what every terminal reads from the server.
function applySharedState(ship, shared) {
	if (!ship || !shared || !shared.seeded) return ship;
	const roster = shared.roster || {};
	(ship.accounts || []).forEach(function (account) {
		const row = roster[account.id];
		if (!row) return;
		if (row.status != null) account.status = row.status;
		if (row.lastLogin != null) account.lastLogin = row.lastLogin;
		if (row.classifiedStatus != null) account.classifiedStatus = row.classifiedStatus;
	});
	if (Array.isArray(shared.systems)) ship.systems = shared.systems;
	if (Array.isArray(shared.announcements)) ship.announcements = shared.announcements;
	if (Array.isArray(shared.logs)) ship.logs = shared.logs;
	return ship;
}

async function loadSharedState(shipId) {
	if (!shipId || !/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/.test(shipId)) return null;
	try {
		const response = await fetch(new URL("api/ships/" + encodeURIComponent(shipId) + "/state", location.href), { cache: "no-store" });
		if (!response.ok) return null;
		return response.json();
	} catch (err) {
		return null;
	}
}

export { applySharedState, loadSharedState };
