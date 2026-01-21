/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

describe('404.astro page', () => {
  it('renders the 404 message', async () => {
    const NotFoundPage = (await import('../../src/pages/404.astro')).default;

    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(NotFoundPage);

    expect(result).toContain('The page you are looking for does not exist.');
    expect(result).toContain('/img/404.webp');
    expect(result).toContain('Go to Home');
  });
});
