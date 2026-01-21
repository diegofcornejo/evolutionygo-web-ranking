/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi, afterEach } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import { experimental_AstroContainer } from 'astro/container';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_API_URL: 'https://api.test.local',
    PUBLIC_DEFAULT_SEASON: '4',
  },
  writable: true,
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();
});

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

vi.mock('@components/Profile/ProfileHeader', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

vi.mock('@components/Profile/StatsOverview', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

vi.mock('@components/Profile/MatchHistory', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

vi.mock('@components/Profile/AchievementShowcase', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

vi.mock('@components/Profile/SeasonSelector.astro', async () => ({
  default: (await import('../__mocks__/SimpleSection.astro')).default,
}));

describe('duelists/[id]/[banlist].astro page', () => {
  it('renders duelist profile sections', async () => {
    global.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/ban-lists')) {
        return Promise.resolve({
          ok: true,
          json: async () => ['Global', '2026.01 OCG'],
        } as Response);
      }

      if (url.includes('/matches')) {
        return Promise.resolve({
          ok: false,
          json: async () => [],
        } as Response);
      }

      if (url.includes('/stats')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            userId: '123',
            username: 'Test',
            points: 120,
            wins: 10,
            losses: 4,
            winRate: 71,
            position: 3,
            achievements: [],
          }),
        } as Response);
      }

      return Promise.resolve({
        ok: false,
        json: async () => ({}),
      } as Response);
    }) as unknown as typeof fetch;

    const DuelistPage = (await import('../../src/pages/duelists/[id]/[banlist].astro')).default;

    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });

    const result = await container.renderToString(DuelistPage, {
      params: { id: '123', banlist: 'Global' },
      request: new Request('https://evolutionygo.com/duelists/123/Global?username=Test&season=1'),
    });

    expect(result).toContain('MockSection');
    expect(result).toContain('MockReactSection');
    expect(result).toContain('Match History');
  });
});
