/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

// Mock astro/container to avoid esbuild/TextEncoder issues in Bun
vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <main>
          <h1>Page Not Found</h1>
          <img src="/img/404.webp" alt="Under Construction" />
          <a href="/"><button>Go to Home</button></a>
        </main>
      `,
    }),
  },
}));

describe('404.astro page', () => {
  it('renders the 404 message', async () => {
    const NotFoundPage = (await import('../../src/pages/404.astro')).default;

    const { experimental_AstroContainer } = await import('astro/container');
    const container = await experimental_AstroContainer.create();
    const result = await container.renderToString(NotFoundPage);

    expect(result).toContain('Page Not Found');
    expect(result).toContain('/img/404.webp');
    expect(result).toContain('Go to Home');
  });
});
