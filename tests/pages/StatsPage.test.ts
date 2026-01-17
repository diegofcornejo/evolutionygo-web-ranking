/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

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

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('@sections/Stats.svelte', () => ({
  default: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <main class="w-full text-[white] text-xl leading-[1.6] mx-auto pt-8">
          <StatsSection client:load></StatsSection>
        </main>
      `,
    }),
  },
}));

describe('stats.astro page', () => {
  it('renders the StatsSection within the page', async () => {
    const StatsPage = (await import('@pages/stats.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(StatsPage));

    expect(result).toContain('StatsSection');
    expect(result).toContain('client:load');
  });
});
