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

    expect(result).toContain('Evolution YGO Season');
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

  it('shows the live marquee right after the title, before the news', async () => {
    for (const edition of ['off', 'halloween']) {
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
