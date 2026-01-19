/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

const astroStub = {
  params: { id: 'test' },
  url: new URL('https://evolutionygo.com/tournaments/test'),
};

Object.defineProperty(globalThis, 'Astro', {
  value: astroStub,
  writable: true,
});

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('@components/Tournaments/ClanList', () => ({
  default: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <main>
          <h2>Tournament TEST</h2>
          <span>Format</span>
          <span>Banlist</span>
          <button>Register</button>
          <ClanList></ClanList>
        </main>
      `,
    }),
  },
}));

describe('tournaments/[id]/index.astro page', () => {
  it('renders tournament details', async () => {
    const TournamentPage = (await import('../../src/pages/tournaments/[id]/index.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(TournamentPage));

    expect(result).toContain('Tournament TEST');
    expect(result).toContain('Register');
    expect(result).toContain('ClanList');
  });
});
