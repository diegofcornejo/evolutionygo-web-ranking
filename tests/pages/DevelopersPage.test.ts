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
          <h1>Developers</h1>
          <div>UnderConstruction</div>
        </section>
      `,
    }),
  },
}));

describe('developers.astro page', () => {
  it('renders the developers placeholder', async () => {
    const DevelopersPage = (await import('../../src/pages/developers.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(DevelopersPage));

    expect(result).toContain('Developers');
    expect(result).toContain('UnderConstruction');
  });
});
