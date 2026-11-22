/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import svelteRenderer from '@astrojs/svelte/server.js';
import { experimental_AstroContainer } from 'astro/container';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_DEFAULT_SEASON: '2024',
  },
  writable: true,
});

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

const fetchNewsFeed = vi.hoisted(() => vi.fn().mockResolvedValue({ news: [], upcomingSeason: null }));

vi.mock('@utils/newsFeed', () => ({ fetchNewsFeed }));

const fetchEvoDuelVersion = vi.hoisted(() => vi.fn().mockResolvedValue(null));

vi.mock('@utils/evoDuelVersion', () => ({ fetchEvoDuelVersion }));

vi.mock('@sections/News', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

vi.mock('@sections/Live.svelte', async () => ({
  default: (await import('../__mocks__/SimpleSvelte.svelte')).default,
}));

vi.mock('@sections/Ranking', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

vi.mock('@sections/Features.astro', async () => ({
  default: (await import('../__mocks__/SimpleSection.astro')).default,
}));

vi.mock('@sections/Download.astro', async () => ({
  default: (await import('../__mocks__/SimpleSection.astro')).default,
}));

vi.mock('@sections/Faqs.astro', async () => ({
  default: (await import('../__mocks__/SimpleSection.astro')).default,
}));

vi.mock('@sections/Crew.astro', async () => ({
  default: (await import('../__mocks__/SimpleSection.astro')).default,
}));

vi.mock('@components/RoomsWebSocketListener', async () => ({
  RoomsWebSocketListener: (await import('../__mocks__/SimpleReact')).default,
}));

// The Layout mock prints the page description and keywords; strip them so page-wide
// text assertions only see rendered content. The SEO test opts back in.
const stripLayoutMeta = (html: string) => html.replace(/ data-layout-(?:description|keywords)="[^"]*"/g, '');

const renderIndex = async (url: string, { withMeta = false } = {}) => {
  const IndexPage = (await import('../../src/pages/index.astro')).default;

  const container = await experimental_AstroContainer.create();
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  container.addServerRenderer({ name: '@astrojs/svelte', renderer: svelteRenderer });
  container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
  container.addClientRenderer({ name: '@astrojs/svelte', entrypoint: '@astrojs/svelte/client.js' });

  const html = await container.renderToString(IndexPage, { request: new Request(url) });
  return withMeta ? html : stripLayoutMeta(html);
};

const weeklyItem = {
  userId: 'w1',
  username: 'WeeklyDuelist',
  points: '27',
  wins: '19',
  losses: '5',
  from: '2026-11-09T00:00:00.000Z',
  to: '2026-11-15T00:00:00.000Z',
};

const stubWeekly = (respond: () => Promise<unknown>) =>
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    if (String(input).includes('/stats/player-of-the-week')) return respond();
    throw new Error(`Unexpected request: ${String(input)}`);
  }));

const rankingIsland = (html: string) => html.match(/<astro-island[^>]*component-url="@sections\/Ranking"[^>]*>/)?.[0] ?? '';

describe('index.astro page', () => {
  beforeEach(() => {
    stubWeekly(async () => ({ ok: true, json: async () => [weeklyItem] }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches the duelist of the week on the server and hands it to the ranking', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(rankingIsland(result)).toContain('WeeklyDuelist');
  });

  it('renders the ranking without a weekly card when that request fails', async () => {
    stubWeekly(async () => { throw new Error('down'); });

    const result = await renderIndex('http://localhost/?edition=off');

    expect(rankingIsland(result)).not.toBe('');
    expect(rankingIsland(result)).not.toContain('WeeklyDuelist');
  });

  it('shows the live EvoDuel version and links it to the release notes', async () => {
    fetchEvoDuelVersion.mockResolvedValueOnce('1.7.0');

    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/<a[^>]*href="https:\/\/evoduel\.com\/#\/releases"[^>]*>\s*v1\.7\.0\s*<\/a>/);
    expect(fetchEvoDuelVersion).toHaveBeenCalled();
  });

  it('hides the version badge when the EvoDuel version is unknown', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).not.toContain('evoduel.com/#/releases');
    expect(result).not.toMatch(/>\s*v\d+\.\d+\.\d+\s*</);
  });

  it('counts down to the upcoming season announced in the news feed', async () => {
    const startsAt = new Date(Date.now() + 9.5 * 24 * 60 * 60 * 1000).toISOString();
    fetchNewsFeed.mockResolvedValueOnce({ news: [], upcomingSeason: { title: 'Season 8 starts December 1', startsAt } });

    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/data-season-countdown[^>]*>[\s\S]*Season 8 starts December 1[\s\S]*in 9 days/);
    expect(result).toContain(`datetime="${startsAt}"`);
  });

  it('shows no countdown when no season is coming', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).not.toContain('data-season-countdown');
  });

  it('invites players to climb the ranks and links to the ranking', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toContain('Climb from Rookie to Master');
    expect(result).toMatch(/<a[^>]*href="#section-ranking"[^>]*>[\s\S]*?See the rankings/);
    expect(result).toMatch(/<a[^>]*href="#section-download"[^>]*>[\s\S]*?Other clients/);
    expect(result).toMatch(/earn rewards\.\s+<a[^>]*href="#section-download"/);
  });

  it('keeps the hero pills readable over the artwork with a dark frosted background', async () => {
    const startsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    fetchNewsFeed.mockResolvedValueOnce({ news: [], upcomingSeason: { title: 'Season 8 starts December 1', startsAt } });
    const result = await renderIndex('http://localhost/?edition=off');
    const offers = result.match(/<ul[^>]*aria-label="What EvoDuel offers"[^>]*>[\s\S]*?<\/ul>/)?.[0] ?? '';
    const pills = [...offers.matchAll(/<li class="([^"]*)"/g)].map((match) => match[1]);
    const countdown = result.match(/<p[^>]*data-season-countdown[^>]*class="([^"]*)"/)?.[1] ?? '';

    expect(pills).toHaveLength(4);
    [...pills, countdown].forEach((classes) => {
      expect(classes).toContain('bg-black/35');
      expect(classes).toContain('backdrop-blur-sm');
    });
  });

  it('shows the rank ladder above the text on phones', async () => {
    const result = await renderIndex('http://localhost/?edition=off');
    const mobile = result.match(/<img[^>]*src="\/hero\/evoduel-ranks-mobile\.webp"[^>]*>/)?.[0] ?? '';

    expect(mobile).toContain('sm:hidden');
    expect(mobile).toContain('alt=""');
    expect(result.indexOf('evoduel-ranks-mobile.webp')).toBeLessThan(result.indexOf('id="evoduel-title"'));
  });

  it('names the formats EvoDuel plays and marks the ones in beta', async () => {
    const result = await renderIndex('http://localhost/?edition=off');
    const formats = result.match(/<ul[^>]*aria-label="Formats"[^>]*>[\s\S]*?<\/ul>/)?.[0] ?? '';

    ['TCG', 'OCG', 'Edison', 'Goat', 'Genesys', 'JTP', 'Rush', 'Speed Duel'].forEach((format) => expect(formats).toContain(format));
    expect(formats.match(/beta/g)).toHaveLength(2);
    expect(formats).toMatch(/Goat[\s\S]*?beta/);
    expect(formats).toMatch(/Speed Duel[\s\S]*?beta/);
    expect(result).not.toContain('No install');
    expect(result).not.toContain('Phone &amp; desktop');
  });

  it('draws the EvoDuel hero over the rank ladder backdrop', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/<img[^>]*src="\/hero\/evoduel-ranks\.webp"[^>]*>/);
    expect(result).toMatch(/<img[^>]*class="[^"]*evoduel-backdrop[^"]*"[^>]*alt=""|<img[^>]*alt=""[^>]*class="[^"]*evoduel-backdrop/);
    expect(result).not.toContain('evoduel-mark');
  });

  it('renders the home sections', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/Evolution YGO · Season \d+/);
    expect(result).not.toContain('shadow-realm-title');
    expect(result).toContain('component-url="@sections/Live.svelte"');
    expect(result).toContain('MockReactSection');
    expect(result).toContain('MockSection');
    expect(fetchNewsFeed).toHaveBeenCalled();
  });

  it('swaps in the Shadow Realm hero during the Halloween edition', async () => {
    const result = await renderIndex('http://localhost/?edition=halloween');

    expect(result).toContain('id="shadow-realm-title"');
    expect(result).toMatch(/class="shadow-realm-season"[^>]*>Season/);
    expect(result).toContain('component-url="@sections/Live.svelte"');
  });

  it('renders the Shadow Realm sound armed, with a mute control', async () => {
    const result = await renderIndex('http://localhost/?edition=halloween');

    expect(result).toMatch(/data-sound-toggle[^>]*aria-pressed="true"[^>]*aria-label="Mute sound"/);
    expect(result).toMatch(/class="shadow-realm-strike[^"]*"[^>]*data-distance="0"/);
    expect(result).toMatch(/class="shadow-realm-strike[^"]*"[^>]*data-distance="0.5"/);
  });

  it('keeps Duel in the dark in the same tab so the vortex can play first', async () => {
    const result = await renderIndex('http://localhost/?edition=halloween');
    const link = result.match(/<a[^>]*data-vortex-link[^>]*>/)?.[0] ?? '';

    expect(link).toContain('href="https://evoduel.com"');
    expect(link).not.toContain('target=');
    expect(result).toContain('shadow-realm-vortex-canvas');
    expect(result).toMatch(/<filter[^>]*data-vortex-filter/);
  });

  it('swaps in the ofrenda hero during Día de Muertos', async () => {
    const result = await renderIndex('http://localhost/?edition=muertos');

    expect(result).toContain('id="ofrenda-title"');
    expect(result).toMatch(/class="ofrenda-season"[^>]*>Season/);
    expect(result).not.toContain('shadow-realm-title');
    expect(result).toContain('href="https://evoduel.com"');
  });

  it('swaps in the winter hero during Christmas', async () => {
    const result = await renderIndex('http://localhost/?edition=christmas');

    expect(result).toContain('id="winter-title"');
    expect(result).toMatch(/class="winter-season"[^>]*>Season/);
    expect(result).toContain('aria-label="Nights until Christmas"');
  });

  it('swaps in the New Year hero with a countdown and fireworks', async () => {
    const result = await renderIndex('http://localhost/?edition=newyear');

    expect(result).toContain('id="newyear-title"');
    expect(result).toContain('data-countdown');
    expect(result).toContain('data-fireworks');
  });

  it('no longer renders the separate player of the week strip', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).not.toContain('Player of the Week');
  });

  it('opens with the EvoDuel block outside editions', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/<h1[^>]*>\s*EvoDuel\s*<\/h1>/);
    expect(result).toMatch(/Evolution YGO · Season \d+/);
    expect(result).toContain('YGO duels in your browser. Against players or the AI, on phone or desktop.');
    for (const highlight of ['Duel the AI', 'Daily missions', 'Essence &amp; shop', 'Cosmetics &amp; emotes']) {
      expect(result).toContain(highlight);
    }
    expect(result).toContain('Play without an account. Sign in to earn rewards.');
    expect(result).toMatch(/<a[^>]*href="https:\/\/evoduel.com"[^>]*data-umami-event="home-click-evoduel-play"/);
    expect(result).toMatch(/<a[^>]*href="#section-download"[^>]*data-umami-event="home-click-other-clients"/);
    expect(result).not.toContain('Play Yu-Gi-Oh!');
  });

  it('reserves the news card height so the marquee does not jump on hydration', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/data-home-news[^>]*class="[^"]*lg:min-h-/);
  });

  it('keeps the edition branch free of the EvoDuel block', async () => {
    const result = await renderIndex('http://localhost/?edition=christmas');

    expect(result).not.toContain('Daily missions');
    expect(result).not.toContain('data-home-news');
    expect(result).toContain('id="winter-title"');
  });

  it('names EvoDuel in the home description and keywords', async () => {
    const result = await renderIndex('http://localhost/?edition=off', { withMeta: true });

    expect(result).toMatch(/data-layout-description="[^"]*Play instantly in your browser with EvoDuel\.[^"]*"/);
    expect(result).toMatch(/data-layout-keywords="[^"]*\bEvoDuel\b[^"]*"/);
  });

  it('puts the news card before the marquee in the DOM so keyboard order follows the desktop row', async () => {
    const result = await renderIndex('http://localhost/?edition=off');
    const title = result.indexOf('</h1>');
    const news = result.indexOf('data-home-news');
    const live = result.indexOf('component-url="@sections/Live.svelte"');

    expect(title).toBeGreaterThan(-1);
    expect(news).toBeGreaterThan(title);
    expect(live).toBeGreaterThan(news);
    expect(result).toMatch(/data-home-news[^>]*class="[^"]*\border-last\b[^"]*\blg:order-none\b/);
  });

  it('lets the hero set the desktop row height so the news card cannot push the marquee', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/data-home-news[^>]*class="[^"]*\blg:relative\b/);
  });

  it('shows the live marquee right after the title, before the news', async () => {
    for (const edition of ['halloween', 'muertos', 'christmas', 'newyear']) {
      const result = await renderIndex(`http://localhost/?edition=${edition}`);
      const title = result.indexOf('</h1>');
      const live = result.indexOf('component-url="@sections/Live.svelte"');
      const news = result.indexOf('MockReactSection');

      expect(title).toBeGreaterThan(-1);
      expect(live).toBeGreaterThan(title);
      expect(news).toBeGreaterThan(live);
    }
  });
});
