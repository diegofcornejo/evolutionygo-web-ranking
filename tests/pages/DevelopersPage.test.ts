/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

describe('developers.astro page', () => {
  it('renders the developers placeholder', async () => {
    const DevelopersPage = (await import('../../src/pages/developers.astro')).default;

    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(DevelopersPage);

    expect(result).toContain('Developers');
    expect(result).toContain('under construction');
  });
});
