import { describe, expect, it, vi } from 'vitest';
import { fetchNewsFeed, parseNewsFeed, parseUpcomingSeason, NEWS_FEED_URL } from '@utils/newsFeed';

const NOW = new Date('2026-11-22T12:00:00Z');
const BANNER = 'https://raw.githubusercontent.com/diangogav/evolution-assets/main/banners/x.webp';

function item(overrides: Record<string, unknown> = {}) {
	return {
		id: 'item',
		date: '2026-11-22',
		tone: 'gold',
		banner: BANNER,
		title: { 'es-419': 'Título', en: 'Title' },
		summary: { 'es-419': 'Resumen', en: 'Summary' },
		...overrides,
	};
}

describe('parseNewsFeed', () => {
	it('maps an item with a banner to a carousel entry in English', () => {
		expect(parseNewsFeed({ items: [item({ link: 'https://example.com/a' })] }, NOW)).toEqual([
			{
				id: 'item',
				image: BANNER,
				title: 'Title',
				description: 'Summary',
				buttonLink: 'https://example.com/a',
				buttonText: 'Learn more',
			},
		]);
	});

	it('keeps only items with an https banner', () => {
		const news = parseNewsFeed(
			{
				items: [
					item({ id: 'no-banner', banner: undefined }),
					item({ id: 'relative-banner', banner: '/banners/x.webp' }),
					item({ id: 'http-banner', banner: 'http://example.com/x.webp' }),
					item({ id: 'kept' }),
				],
			},
			NOW
		);
		expect(news.map((entry) => entry.id)).toEqual(['kept']);
	});

	it('drops expired items and keeps items that expire later', () => {
		const news = parseNewsFeed(
			{
				items: [
					item({ id: 'expired', expiresAt: '2026-11-22T11:59:59Z' }),
					item({ id: 'live', expiresAt: '2026-11-23T00:00:00Z' }),
				],
			},
			NOW
		);
		expect(news.map((entry) => entry.id)).toEqual(['live']);
	});

	it('orders items newest first', () => {
		const news = parseNewsFeed(
			{
				items: [
					item({ id: 'old', date: '2026-08-28' }),
					item({ id: 'new', date: '2026-11-22' }),
					item({ id: 'mid', date: '2026-11-13' }),
				],
			},
			NOW
		);
		expect(news.map((entry) => entry.id)).toEqual(['new', 'mid', 'old']);
	});

	it('falls back to Spanish when the English text is missing', () => {
		const [entry] = parseNewsFeed(
			{ items: [item({ title: { 'es-419': 'Solo español' }, summary: { 'es-419': 'Texto' } })] },
			NOW
		);
		expect(entry.title).toBe('Solo español');
		expect(entry.description).toBe('Texto');
	});

	it('skips items without an id, a valid date or a title', () => {
		const news = parseNewsFeed(
			{
				items: [
					item({ id: '' }),
					item({ id: 'bad-date', date: 'soon' }),
					item({ id: 'no-title', title: {} }),
					null,
					'junk',
				],
			},
			NOW
		);
		expect(news).toEqual([]);
	});

	it('returns no news for a payload without items', () => {
		expect(parseNewsFeed(null, NOW)).toEqual([]);
		expect(parseNewsFeed({}, NOW)).toEqual([]);
		expect(parseNewsFeed({ items: 'nope' }, NOW)).toEqual([]);
	});

	it('points client routes and missing links at the game', () => {
		const news = parseNewsFeed(
			{
				items: [
					item({ id: 'route', link: '/collection?wing=shop', kind: 'shop' }),
					item({ id: 'none' }),
				],
			},
			NOW
		);
		expect(news[0]).toMatchObject({ buttonLink: 'https://evoduel.com/#/collection?wing=shop', buttonText: 'Visit the shop' });
		expect(news[1]).toMatchObject({ buttonLink: 'https://evoduel.com', buttonText: 'Play now' });
	});

	it('sends a season item without a link to the rankings', () => {
		const [entry] = parseNewsFeed({ items: [item({ kind: 'season' })] }, NOW);
		expect(entry).toMatchObject({ buttonLink: '#section-ranking', buttonText: 'See the rankings' });
	});

	it('words a tournament button by its destination', () => {
		const [entry] = parseNewsFeed({ items: [item({ kind: 'tournament', link: '/tournaments' })] }, NOW);
		expect(entry).toMatchObject({ buttonLink: 'https://evoduel.com/#/tournaments', buttonText: 'See tournaments' });
	});
});

describe('parseUpcomingSeason', () => {
	const season = (overrides: Record<string, unknown> = {}) =>
		item({
			id: 'season-8',
			kind: 'season',
			eventAt: '2026-12-01T00:00:00-04:00',
			title: { 'es-419': 'La Temporada 8 empieza el 1 de diciembre', en: 'Season 8 starts December 1' },
			...overrides,
		});

	it('picks the featured season item that has not started yet', () => {
		expect(parseUpcomingSeason({ items: [season()] }, NOW)).toEqual({
			title: 'Season 8 starts December 1',
			startsAt: '2026-12-01T00:00:00-04:00',
		});
	});

	it('ignores season items without a banner, like calendar-only events', () => {
		expect(parseUpcomingSeason({ items: [season({ banner: undefined })] }, NOW)).toBeNull();
	});

	it('ignores items of another kind and seasons that already started', () => {
		const items = [season({ kind: 'shop' }), season({ eventAt: '2026-11-22T11:00:00Z' })];
		expect(parseUpcomingSeason({ items }, NOW)).toBeNull();
	});

	it('picks the soonest upcoming season', () => {
		const items = [
			season({ id: 'later', eventAt: '2027-03-01T00:00:00Z', title: { en: 'Season 9' } }),
			season({ id: 'sooner', title: { en: 'Season 8' } }),
		];
		expect(parseUpcomingSeason({ items }, NOW)?.title).toBe('Season 8');
	});

	it('ignores expired items and invalid payloads', () => {
		expect(parseUpcomingSeason({ items: [season({ expiresAt: '2026-11-22T00:00:00Z' })] }, NOW)).toBeNull();
		expect(parseUpcomingSeason(null, NOW)).toBeNull();
		expect(parseUpcomingSeason({ items: [season({ eventAt: 'soon' })] }, NOW)).toBeNull();
	});
});

describe('fetchNewsFeed', () => {
	it('reads the feed from evolution-assets once and returns news and the upcoming season', async () => {
		const items = [item(), item({ id: 'season-8', kind: 'season', eventAt: '2026-12-01T04:00:00Z' })];
		const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items })));
		const feed = await fetchNewsFeed({ fetchImpl, now: NOW });
		expect(fetchImpl).toHaveBeenCalledTimes(1);
		expect(fetchImpl).toHaveBeenCalledWith(NEWS_FEED_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }));
		expect(feed.news.map((entry) => entry.id)).toEqual(['item', 'season-8']);
		expect(feed.upcomingSeason).toEqual({ title: 'Title', startsAt: '2026-12-01T04:00:00Z' });
		expect(NEWS_FEED_URL).toBe('https://raw.githubusercontent.com/diangogav/evolution-assets/main/news.json');
	});

	it('returns an empty feed when the request fails', async () => {
		const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'));
		expect(await fetchNewsFeed({ fetchImpl, now: NOW })).toEqual({ news: [], upcomingSeason: null });
	});

	it('returns an empty feed on a non-OK response or invalid JSON', async () => {
		const notFound = vi.fn().mockResolvedValue(new Response('missing', { status: 404 }));
		const invalid = vi.fn().mockResolvedValue(new Response('{not json'));
		expect(await fetchNewsFeed({ fetchImpl: notFound, now: NOW })).toEqual({ news: [], upcomingSeason: null });
		expect(await fetchNewsFeed({ fetchImpl: invalid, now: NOW })).toEqual({ news: [], upcomingSeason: null });
	});
});
