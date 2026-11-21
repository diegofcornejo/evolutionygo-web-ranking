/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
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

vi.mock('@components/Cards/DuelistOfTheWeek.astro', async () => ({
  default: (await import('../__mocks__/SimpleSection.astro')).default,
}));

const renderIndex = async (url: string) => {
  const IndexPage = (await import('../../src/pages/index.astro')).default;

  const container = await experimental_AstroContainer.create();
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  container.addServerRenderer({ name: '@astrojs/svelte', renderer: svelteRenderer });
  container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
  container.addClientRenderer({ name: '@astrojs/svelte', entrypoint: '@astrojs/svelte/client.js' });

  return container.renderToString(IndexPage, { request: new Request(url) });
};

describe('index.astro page', () => {
  it('renders the home sections', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/Evolution YGO · Season \d+/);
    expect(result).not.toContain('shadow-realm-title');
    expect(result).toContain('component-url="@sections/Live.svelte"');
    expect(result).toContain('MockReactSection');
    expect(result).toContain('MockSection');
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

  it('opens with the EvoDuel block outside editions', async () => {
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/<h1[^>]*>\s*EvoDuel\s*<\/h1>/);
    expect(result).toMatch(/Evolution YGO · Season \d+/);
    expect(result).toContain('YGO duels in your browser. Against players or the AI, on phone or desktop.');
    for (const highlight of ['Duel the AI', 'Phone &amp; desktop', 'No install', 'Daily missions', 'Essence &amp; shop', 'Cosmetics &amp; emotes']) {
      expect(result).toContain(highlight);
    }
    expect(result).toContain('Play without an account. Sign in to earn rewards.');
    expect(result).toMatch(/<a[^>]*href="https:\/\/evoduel.com"[^>]*data-umami-event="home-click-evoduel-play"/);
    expect(result).toMatch(/<a[^>]*href="#section-download"[^>]*data-umami-event="home-click-other-clients"/);
    const hero = result.match(/<section[^>]*aria-labelledby="evoduel-title"[\s\S]*?<\/section>/)?.[0] ?? '';
    expect(hero).toContain('EvoDuel');
    expect(hero).not.toContain('Play Yu-Gi-Oh!');
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
    const result = await renderIndex('http://localhost/?edition=off');

    expect(result).toMatch(/data-layout-description="[^"]*Play instantly in your browser with EvoDuel\.[^"]*"/);
    expect(result).toMatch(/data-layout-keywords="[^"]*\bEvoDuel\b[^"]*"/);
  });

  it('shows the live marquee right after the title, before the news', async () => {
    for (const edition of ['off', 'halloween', 'muertos', 'christmas', 'newyear']) {
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
