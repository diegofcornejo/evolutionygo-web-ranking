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
  it('asks for the player avatar and renders the profile when that call fails', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('/avatars?')) throw new Error('avatars down');
      if (url.includes('/stats')) {
        return { ok: true, json: async () => ({ userId: '123', username: 'Test', points: 1, wins: 1, losses: 0, winRate: 100, position: 1, achievements: [] }) } as Response;
      }
      return { ok: false, json: async () => ({}) } as Response;
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const DuelistPage = (await import('../../src/pages/duelists/[id]/[banlist].astro')).default;
    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });

    const result = await container.renderToString(DuelistPage, {
      params: { id: '123', banlist: 'Global' },
      request: new Request('https://evolutionygo.com/duelists/123/Global?username=Test&season=1'),
    });

    expect(result).toContain('Match History');
    expect(fetchMock.mock.calls.some(([url]) => String(url).endsWith('/avatars?userIds=123'))).toBe(true);
  });

  describe('rank card', () => {
    const ratings = [
      { banListName: 'TCG', rankType: 'group', rating: 1129, peak: 1193, tier: { id: 'master', name: 'Master', progress: null } },
      { banListName: 'Genesys', rankType: 'banlist', rating: 1067, tier: { id: 'silver', name: 'Silver', progress: null } },
    ];
    const ladder = {
      tiers: [
        { id: 'rookie', name: 'Rookie', order: 0, kind: 'placement', threshold: null, minGames: 5, distinctOpponentWins: null, requiresTier: null, size: null },
        { id: 'master', name: 'Master', order: 6, kind: 'relative', threshold: null, minGames: 20, distinctOpponentWins: null, requiresTier: 'platinum', size: 5 },
      ],
    };

    const renderProfile = async (banlist: string, { banlistStatsFail = false } = {}) => {
      const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
        const url = input.toString();
        const ok = (body: unknown) => ({ ok: true, json: async () => body }) as Response;
        if (url.includes('/ranked-tiers')) return ok(ladder);
        if (url.includes('/ban-lists')) return ok(['Global', 'TCG', 'OCG']);
        if (url.includes('/matches')) return { ok: false, json: async () => [] } as Response;
        if (banlistStatsFail && url.includes('/stats') && url.includes('banListName=')) {
          return { ok: false, status: 404, json: async () => ({}) } as Response;
        }
        if (url.includes('/stats')) {
          return ok({ userId: '123', username: 'Test', points: 120, wins: 10, losses: 4, winRate: 71, position: 3, achievements: [], ratings });
        }
        return { ok: false, json: async () => ({}) } as Response;
      });
      global.fetch = fetchMock as unknown as typeof fetch;

      const DuelistPage = (await import('../../src/pages/duelists/[id]/[banlist].astro')).default;
      const container = await experimental_AstroContainer.create();
      container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
      container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
      const result = await container.renderToString(DuelistPage, {
        params: { id: '123', banlist },
        request: new Request(`https://evolutionygo.com/duelists/123/${banlist}?username=Test&season=7`),
      });
      return { result, fetchMock };
    };

    it('fetches the ladder for the banlist and renders the rank card', async () => {
      const { result, fetchMock } = await renderProfile('TCG');

      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/ranked-tiers?banListName=TCG'))).toBe(true);
      expect(result).toContain('data-rank-card');
      expect(result).toContain('Top 5 of the ladder');
      expect(result).toContain('Also ranked in');
      expect(result).toContain('Genesys');
    });

    it('skips the rank card when the banlist has no rating', async () => {
      const { result } = await renderProfile('OCG');

      expect(result).toContain('data-rank-card');
      expect(result).not.toContain('Top 5 of the ladder');
      expect(result).toContain('Also ranked in');
    });

    it('takes the ranks from the Global stats when the ban list stats fail', async () => {
      const { result } = await renderProfile('OCG', { banlistStatsFail: true });

      expect(result).toContain('Also ranked in');
      expect(result).toContain('Genesys');
    });

    it('decodes the ban list once and encodes it once in API calls', async () => {
      const { fetchMock } = await renderProfile('A%2BB');
      const urls = fetchMock.mock.calls.map(([url]) => String(url));

      expect(urls.some((url) => url.includes('/stats?') && url.includes('banListName=A%2BB'))).toBe(true);
      expect(urls.some((url) => url.includes('/ranked-tiers?banListName=A%2BB'))).toBe(true);
      expect(urls.some((url) => url.includes('%252B'))).toBe(false);
    });

    it('does not ask for a ladder on Global', async () => {
      const { result, fetchMock } = await renderProfile('Global');

      expect(fetchMock.mock.calls.some(([url]) => String(url).includes('/ranked-tiers'))).toBe(false);
      expect(result).toContain('Also ranked in');
    });
  });
});
