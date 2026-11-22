const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** How far away an instant is, in words ("in 8 days", "tomorrow", "in 5 hours"); null once it has passed. */
export function formatCountdown(startsAt: string, now: Date): string | null {
	const remaining = Date.parse(startsAt) - now.getTime();
	if (Number.isNaN(remaining) || remaining <= 0) return null;
	if (remaining >= 2 * DAY_MS) return `in ${Math.floor(remaining / DAY_MS)} days`;
	if (remaining >= DAY_MS) return 'tomorrow';
	if (remaining >= HOUR_MS) {
		const hours = Math.floor(remaining / HOUR_MS);
		return `in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
	}
	return 'very soon';
}
