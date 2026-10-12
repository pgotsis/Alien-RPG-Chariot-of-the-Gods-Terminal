// This browser only: who is logged in here, which coded files this station has opened,
// and notes typed at this station. Ship status is not stored here.
function emptySession() {
	return { accountId: null, unlocked: [], scratch: {}, seenPulses: [], overrideToken: null };
}

function sessionKey(shipId) {
	return "muthr:" + shipId;
}

function loadSession(shipId) {
	try {
		const raw = localStorage.getItem(sessionKey(shipId));
		if (!raw) return emptySession();
		const parsed = JSON.parse(raw);
		return {
			accountId: parsed.accountId || null,
			unlocked: Array.isArray(parsed.unlocked) ? parsed.unlocked : [],
			scratch: parsed.scratch && typeof parsed.scratch === "object" ? parsed.scratch : {},
			seenPulses: Array.isArray(parsed.seenPulses) ? parsed.seenPulses : [],
			overrideToken: parsed.overrideToken || null
		};
	} catch (err) {
		return emptySession();
	}
}

function saveSession(shipId, session) {
	localStorage.setItem(sessionKey(shipId), JSON.stringify(session));
}

function resetSession(shipId) {
	localStorage.removeItem(sessionKey(shipId));
}

export { emptySession, loadSession, saveSession, resetSession };
