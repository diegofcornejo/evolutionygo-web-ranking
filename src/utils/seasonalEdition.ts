/**
 * Seasonal editions switch the site's look on and off by date, so nothing has
 * to be deployed to start or end one and the same window runs every year.
 *
 * The window is checked in UTC on the server. The "tonight" marker is
 * recomputed in the visitor's own timezone on the client.
 */

export type SeasonalEdition = 'halloween';

type MonthDay = { month: number; day: number };

/** Months are 1-based. Both ends are inclusive. */
export const HALLOWEEN_WINDOW: { start: MonthDay; end: MonthDay } = {
	start: { month: 10, day: 1 },
	end: { month: 11, day: 2 },
};

export const HALLOWEEN_NIGHT: MonthDay = { month: 10, day: 31 };

const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

export const formatMonthDay = ({ month, day }: MonthDay) => `${MONTH_NAMES[month - 1]} ${day}`;

/** `?edition=halloween` previews the edition outside its window; `?edition=off` hides it inside. */
export const EDITION_PARAM = 'edition';

const toKey = ({ month, day }: MonthDay) => month * 100 + day;

export const isInHalloweenWindow = (date: Date): boolean => {
	const key = toKey({ month: date.getUTCMonth() + 1, day: date.getUTCDate() });
	return key >= toKey(HALLOWEEN_WINDOW.start) && key <= toKey(HALLOWEEN_WINDOW.end);
};

export const getSeasonalEdition = (now: Date, override?: string | null): SeasonalEdition | null => {
	if (override === 'halloween') return 'halloween';
	if (override === 'off') return null;
	return isInHalloweenWindow(now) ? 'halloween' : null;
};

export type EditionNight = {
	month: number;
	day: number;
	isHalloween: boolean;
};

/** Every night of the window, in order, for the year the window falls in. */
export const getHalloweenNights = (year: number): EditionNight[] => {
	const nights: EditionNight[] = [];
	const cursor = new Date(Date.UTC(year, HALLOWEEN_WINDOW.start.month - 1, HALLOWEEN_WINDOW.start.day));
	const last = Date.UTC(year, HALLOWEEN_WINDOW.end.month - 1, HALLOWEEN_WINDOW.end.day);
	while (cursor.getTime() <= last) {
		const month = cursor.getUTCMonth() + 1;
		const day = cursor.getUTCDate();
		nights.push({
			month,
			day,
			isHalloween: month === HALLOWEEN_NIGHT.month && day === HALLOWEEN_NIGHT.day,
		});
		cursor.setUTCDate(cursor.getUTCDate() + 1);
	}
	return nights;
};

/**
 * Index of the night matching a calendar date, or -1 outside the window.
 * Before the window opens (a preview) it is also -1, so no night is lit.
 */
export const getTonightIndex = (nights: EditionNight[], month: number, day: number): number =>
	nights.findIndex((night) => night.month === month && night.day === day);
