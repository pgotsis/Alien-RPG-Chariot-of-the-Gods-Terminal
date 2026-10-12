// Live rows for one table. The scenario file is only the seed.
function applySharedState(ship, shared) {
	if (!ship || !shared) return ship;
	if (Array.isArray(shared.accounts)) ship.accounts = shared.accounts;
	for (const field of ["date", "name", "computer"]) if (shared[field] != null) ship[field] = shared[field];
	const roster = shared.roster || {};
	(ship.accounts || []).forEach(function (account) {
		const row = roster[account.id];
		if (!row) return;
		if (row.status != null) account.status = row.status;
		if (row.lastLogin != null) account.lastLogin = row.lastLogin;
		if (row.classifiedStatus != null) account.classifiedStatus = row.classifiedStatus;
	});
	if (shared.blueprints) Object.assign(ship, shared.blueprints);
	if (shared.starMap) ship.starMap = shared.starMap;
	if (Array.isArray(shared.modules)) ship.modules = shared.modules;
	if (Array.isArray(shared.systems)) ship.systems = shared.systems;
	if (Array.isArray(shared.announcements)) ship.announcements = shared.announcements;
	if (Array.isArray(shared.logs)) ship.logs = shared.logs;
	if (Array.isArray(shared.mail)) ship.mail = shared.mail;
	if (Array.isArray(shared.notes)) ship.notes = shared.notes;
	return ship;
}

export { applySharedState };
