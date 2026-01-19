/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';

Object.defineProperty(import.meta, 'env', {
  value: {
    PUBLIC_DEFAULT_SEASON: '2024',
  },
  writable: true,
});

vi.mock('@layouts/Layout.astro', () => ({
  default: () => '',
}));

vi.mock('@sections/News', () => ({
  default: () => '',
}));

vi.mock('@sections/Live.svelte', () => ({
  default: () => '',
}));

vi.mock('@sections/Ranking', () => ({
  default: () => '',
}));

vi.mock('@sections/Features.astro', () => ({
  default: () => '',
}));

vi.mock('@sections/Download.astro', () => ({
  default: () => '',
}));

vi.mock('@sections/Faqs.astro', () => ({
  default: () => '',
}));

vi.mock('@sections/Crew.astro', () => ({
  default: () => '',
}));

vi.mock('@components/RoomsWebSocketListener', () => ({
  RoomsWebSocketListener: () => '',
}));

vi.mock('@components/Cards/DuelistOfTheWeek.astro', () => ({
  default: () => '',
}));

vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: async () => `
        <main>
          <h1>Evolution YGO Season 2024</h1>
          <News></News>
          <RoomsWebSocketListener></RoomsWebSocketListener>
          <Live></Live>
          <DuelistOfTheWeek></DuelistOfTheWeek>
          <Ranking></Ranking>
          <Features></Features>
          <Download></Download>
          <Faqs></Faqs>
          <Crew></Crew>
        </main>
      `,
    }),
  },
}));

describe('index.astro page', () => {
  it('renders the home sections', async () => {
    const IndexPage = (await import('../../src/pages/index.astro')).default;

    const result = await (await import('astro/container'))
      .experimental_AstroContainer.create()
      .then(c => c.renderToString(IndexPage));

    expect(result).toContain('Evolution YGO Season 2024');
    expect(result).toContain('News');
    expect(result).toContain('RoomsWebSocketListener');
    expect(result).toContain('Live');
    expect(result).toContain('DuelistOfTheWeek');
    expect(result).toContain('Ranking');
  });
});
