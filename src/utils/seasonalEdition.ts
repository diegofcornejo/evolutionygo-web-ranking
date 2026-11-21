/**
 * Seasonal editions switch the site's look on and off by date, so nothing has
 * to be deployed to start or end one and the same window runs every year.
 *
 * The window is checked in UTC on the server. The "tonight" marker is
 * recomputed in the visitor's own timezone on the client.
 */

export type SeasonalEdition = 'halloween' | 'muertos' | 'christmas' | 'newyear';

type MonthDay = { month: number; day: number };

type EditionWindow = { start: MonthDay; end: MonthDay };

/** Months are 1-based. Both ends are inclusive. A window may wrap past December 31. */
export const HALLOWEEN_WINDOW: EditionWindow = {
	start: { month: 10, day: 1 },
	end: { month: 10, day: 31 },
};

/** Día de Muertos takes over from Halloween for its two days. */
export const MUERTOS_WINDOW: EditionWindow = {
	start: { month: 11, day: 1 },
	end: { month: 11, day: 2 },
};

export const CHRISTMAS_WINDOW: EditionWindow = {
	start: { month: 12, day: 1 },
	end: { month: 12, day: 25 },
};

/** Runs from the day after Christmas into the new year, through Epiphany. */
export const NEWYEAR_WINDOW: EditionWindow = {
	start: { month: 12, day: 26 },
	end: { month: 1, day: 6 },
};

const EDITION_WINDOWS: Record<SeasonalEdition, EditionWindow> = {
	halloween: HALLOWEEN_WINDOW,
	muertos: MUERTOS_WINDOW,
	christmas: CHRISTMAS_WINDOW,
	newyear: NEWYEAR_WINDOW,
};

const EDITIONS = Object.keys(EDITION_WINDOWS) as SeasonalEdition[];

export const HALLOWEEN_NIGHT: MonthDay = { month: 10, day: 31 };

const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

export const formatMonthDay = ({ month, day }: MonthDay) => `${MONTH_NAMES[month - 1]} ${day}`;

/** `?edition=<name>` previews an edition outside its window; `?edition=off` hides it inside. */
export const EDITION_PARAM = 'edition';

const toKey = ({ month, day }: MonthDay) => month * 100 + day;

const wraps = ({ start, end }: EditionWindow) => toKey(start) > toKey(end);

const isInWindow = (date: Date, window: EditionWindow): boolean => {
	const key = toKey({ month: date.getUTCMonth() + 1, day: date.getUTCDate() });
	const afterStart = key >= toKey(window.start);
	const beforeEnd = key <= toKey(window.end);
	return wraps(window) ? afterStart || beforeEnd : afterStart && beforeEnd;
};

export const isInHalloweenWindow = (date: Date): boolean => isInWindow(date, HALLOWEEN_WINDOW);

export const isInMuertosWindow = (date: Date): boolean => isInWindow(date, MUERTOS_WINDOW);

export const isInChristmasWindow = (date: Date): boolean => isInWindow(date, CHRISTMAS_WINDOW);

export const isInNewYearWindow = (date: Date): boolean => isInWindow(date, NEWYEAR_WINDOW);

const isEdition = (value: string): value is SeasonalEdition => (EDITIONS as string[]).includes(value);

export const getSeasonalEdition = (now: Date, override?: string | null): SeasonalEdition | null => {
	if (override && isEdition(override)) return override;
	if (override === 'off') return null;
	return EDITIONS.find((edition) => isInWindow(now, EDITION_WINDOWS[edition])) ?? null;
};

export type EditionNight = {
	month: number;
	day: number;
	isHalloween: boolean;
};

/** Every night of a window, in order, for the window that opens in `year`. */
const getNights = (year: number, window: EditionWindow): EditionNight[] => {
	const nights: EditionNight[] = [];
	const cursor = new Date(Date.UTC(year, window.start.month - 1, window.start.day));
	const last = Date.UTC(year + (wraps(window) ? 1 : 0), window.end.month - 1, window.end.day);
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

export const getHalloweenNights = (year: number): EditionNight[] => getNights(year, HALLOWEEN_WINDOW);

export const getMuertosNights = (year: number): EditionNight[] => getNights(year, MUERTOS_WINDOW);

export const getChristmasNights = (year: number): EditionNight[] => getNights(year, CHRISTMAS_WINDOW);

/** The year the New Year edition welcomes: this year in January, next year any other month. */
export const getWelcomedYear = (now: Date): number =>
	now.getUTCMonth() === 0 ? now.getUTCFullYear() : now.getUTCFullYear() + 1;

/**
 * Index of the night matching a calendar date, or -1 outside the window.
 * Before the window opens (a preview) it is also -1, so no night is lit.
 */
export const getTonightIndex = (nights: EditionNight[], month: number, day: number): number =>
	nights.findIndex((night) => night.month === month && night.day === day);
