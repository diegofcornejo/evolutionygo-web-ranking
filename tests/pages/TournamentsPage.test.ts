/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('@components/UnderConstruction.astro', () => ({
  default: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <section>
          <h1>Tournaments</h1>
          <div>UnderConstruction</div>
        </section>
      `,
    }),
  },
}));

describe('tournaments/index.astro page', () => {
  it('renders the tournaments placeholder', async () => {
    const TournamentsPage = (await import('../../src/pages/tournaments/index.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(TournamentsPage));

    expect(result).toContain('Tournaments');
    expect(result).toContain('UnderConstruction');
  });
});
