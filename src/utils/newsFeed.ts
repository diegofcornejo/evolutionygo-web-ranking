import type { News } from '@types';
import { EVODUEL_URL, evoDuelRoute } from '@utils/evoDuel';

/**
 * The news feed the game client also reads. An item reaches this site's carousel only when it
 * carries a `banner` (an https URL of a wide 3:1 image); the field list is documented in the
 * `$comment` of the file itself.
 */
export const NEWS_FEED_URL = 'https://raw.githubusercontent.com/diangogav/evolution-assets/main/news.json';

const RANKING_ANCHOR = '#section-ranking';
const FETCH_TIMEOUT_MS = 3000;

type Kind = 'shop' | 'season' | 'tournament';

const BUTTON_TEXT: Record<Kind, string> = {
	shop: 'Visit the shop',
	season: 'See the rankings',
	tournament: 'See tournaments',
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function text(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

/** English first, Spanish when the English text is missing. */
function localized(value: unknown): string {
	if (!isRecord(value)) return '';
	return text(value.en) || text(value['es-419']);
}

function httpsUrl(value: unknown): string | undefined {
	const url = text(value);
	return url.startsWith('https://') ? url : undefined;
}

function kindOf(value: unknown): Kind | undefined {
	return value === 'shop' || value === 'season' || value === 'tournament' ? value : undefined;
}

/** Where the button leads: a client route becomes a game URL (hash route), an https link stays as is. */
function destination(link: unknown, kind: Kind | undefined): { buttonLink: string; buttonText: string } {
	const route = text(link);
	if (route.startsWith('https://')) {
		return { buttonLink: route, buttonText: kind ? BUTTON_TEXT[kind] : 'Learn more' };
	}
	if (route.startsWith('/')) {
		return { buttonLink: evoDuelRoute(route), buttonText: kind ? BUTTON_TEXT[kind] : 'Play now' };
	}
	if (kind === 'season') return { buttonLink: RANKING_ANCHOR, buttonText: BUTTON_TEXT.season };
	return { buttonLink: EVODUEL_URL, buttonText: 'Play now' };
}

function isLive(expiresAt: unknown, now: Date): boolean {
	if (typeof expiresAt !== 'string') return true;
	const instant = Date.parse(expiresAt);
	return Number.isNaN(instant) || instant > now.getTime();
}

type Dated = News & { date: number };

function parseItem(raw: unknown, now: Date): Dated | null {
	if (!isRecord(raw)) return null;
	const id = text(raw.id);
	const date = typeof raw.date === 'string' ? Date.parse(raw.date) : Number.NaN;
	const image = httpsUrl(raw.banner);
	const title = localized(raw.title);
	if (!id || Number.isNaN(date) || !image || !title || !isLive(raw.expiresAt, now)) return null;
	return {
		id,
		date,
		image,
		title,
		description: localized(raw.summary),
		...destination(raw.link, kindOf(raw.kind)),
	};
}

/** The carousel entries of a news feed payload: items with a banner, not expired, newest first. */
export function parseNewsFeed(raw: unknown, now: Date): News[] {
	if (!isRecord(raw) || !Array.isArray(raw.items)) return [];
	return raw.items
		.map((item) => parseItem(item, now))
		.filter((item): item is Dated => item !== null)
		.sort((a, b) => b.date - a.date)
		.map(({ date: _date, ...news }) => news);
}

export interface UpcomingSeason {
	/** The item's title in English, Spanish when the English text is missing. */
	title: string;
	/** ISO instant the season starts (the item's `eventAt`). */
	startsAt: string;
}

/**
 * The soonest season announcement that has not started yet. Only season items that the site
 * features (they carry a banner) count, so calendar-only events of kind `season` stay out.
 */
export function parseUpcomingSeason(raw: unknown, now: Date): UpcomingSeason | null {
	if (!isRecord(raw) || !Array.isArray(raw.items)) return null;
	let soonest: (UpcomingSeason & { at: number }) | null = null;
	for (const item of raw.items) {
		if (!isRecord(item) || item.kind !== 'season' || !httpsUrl(item.banner) || !isLive(item.expiresAt, now)) continue;
		const startsAt = text(item.eventAt);
		const at = Date.parse(startsAt);
		const title = localized(item.title);
		if (Number.isNaN(at) || at <= now.getTime() || !title) continue;
		if (!soonest || at < soonest.at) soonest = { title, startsAt, at };
	}
	return soonest && { title: soonest.title, startsAt: soonest.startsAt };
}

export interface NewsFeed {
	news: News[];
	upcomingSeason: UpcomingSeason | null;
}

const EMPTY_FEED: NewsFeed = { news: [], upcomingSeason: null };

interface FetchNewsOptions {
	fetchImpl?: typeof fetch;
	now?: Date;
}

/** Reads the feed once; any failure (offline, timeout, bad status, bad JSON) yields an empty feed. */
export async function fetchNewsFeed({ fetchImpl = fetch, now = new Date() }: FetchNewsOptions = {}): Promise<NewsFeed> {
	try {
		const response = await fetchImpl(NEWS_FEED_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
		if (!response.ok) return EMPTY_FEED;
		const raw: unknown = await response.json();
		return { news: parseNewsFeed(raw, now), upcomingSeason: parseUpcomingSeason(raw, now) };
	} catch {
		return EMPTY_FEED;
	}
}
