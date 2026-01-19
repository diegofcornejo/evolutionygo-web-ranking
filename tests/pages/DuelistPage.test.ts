/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_API_URL: 'https://api.test.local',
    PUBLIC_DEFAULT_SEASON: '4',
  },
  writable: true,
});

const astroStub = {
  params: { id: '123', banlist: 'Global' },
  url: new URL('https://evolutionygo.com/duelists/123/Global?username=Test&season=1'),
};

Object.defineProperty(globalThis, 'Astro', {
  value: astroStub,
  writable: true,
});

vi.spyOn(global, 'fetch').mockImplementation((input: RequestInfo | URL) => {
  const url = input.toString();
  if (url.includes('/ban-lists')) {
    return Promise.resolve({
      ok: true,
      json: async () => ['Global'],
    } as Response);
  }
  return Promise.resolve({ ok: false } as Response);
});

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('@components/Profile/ProfileHeader', () => ({
  default: () => '',
}));

vi.mock('@components/Profile/StatsOverview', () => ({
  default: () => '',
}));

vi.mock('@components/Profile/MatchHistory', () => ({
  default: () => '',
}));

vi.mock('@components/Profile/AchievementShowcase', () => ({
  default: () => '',
}));

vi.mock('@components/Profile/SeasonSelector.astro', () => ({
  default: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <main>
          <SeasonSelector></SeasonSelector>
          <ProfileHeader></ProfileHeader>
          <StatsOverview></StatsOverview>
          <AchievementShowcase></AchievementShowcase>
          <h2>Match History</h2>
          <MatchHistory></MatchHistory>
        </main>
      `,
    }),
  },
}));

describe('duelists/[id]/[banlist].astro page', () => {
  it('renders duelist profile sections', async () => {
    const DuelistPage = (await import('../../src/pages/duelists/[id]/[banlist].astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(DuelistPage));

    expect(result).toContain('SeasonSelector');
    expect(result).toContain('ProfileHeader');
    expect(result).toContain('StatsOverview');
    expect(result).toContain('AchievementShowcase');
    expect(result).toContain('Match History');
  });
});
