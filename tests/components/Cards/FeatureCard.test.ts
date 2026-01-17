/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

// Mock astro/container to avoid esbuild/TextEncoder issues in Bun
vi.mock('astro/container', () => ({
  experimental_AstroContainer: {
    create: async () => ({
      renderToString: () =>
        '<div>Cool Feature This is a cool feature. mdi:star</div>',
    }),
  },
}));

import FeatureCard from '@components/Cards/FeatureCard.astro';

describe('FeatureCard.astro', () => {
  it('renders feature info', async () => {
    const { experimental_AstroContainer } = await import('astro/container');
    const container = await experimental_AstroContainer.create();
    const props = {
      title: 'Cool Feature',
      description: 'This is a cool feature.',
      icon: 'mdi:star',
    };
    const result = await container.renderToString(FeatureCard, { props });
    expect(result).toContain('Cool Feature');
    expect(result).toContain('This is a cool feature.');
    expect(result).toContain('mdi:star');
  });
}); 