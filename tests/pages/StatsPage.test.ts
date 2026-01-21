/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import { experimental_AstroContainer } from 'astro/container';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_DEFAULT_SEASON: '2024',
  },
  writable: true,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

vi.mock('@sections/Stats.svelte', async () => ({
  default: (await import('../__mocks__/SimpleReact')).default,
}));

describe('stats.astro page', () => {
  it('renders the StatsSection within the page', async () => {
    const StatsPage = (await import('@pages/stats.astro')).default;

    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });

    const result = await container.renderToString(StatsPage);

    expect(result).toContain('MockReactSection');
  });
});
