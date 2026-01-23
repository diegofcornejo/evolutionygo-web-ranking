/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

describe('tournaments/[id]/index.astro page', () => {
  it('renders tournament details', async () => {
    const TournamentPage = (await import('../../src/pages/tournaments/[id]/index.astro')).default;
    const container = await experimental_AstroContainer.create();
    container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
    container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });

    const result = await container.renderToString(TournamentPage, {
      params: { id: 'test' },
      request: new Request('https://evolutionygo.com/tournaments/test'),
    });

    expect(result).toContain('TEST');
    expect(result).toContain('Request Join');
    expect(result).toContain('Double Elimination');
    expect(result).toContain('brackets-viewer');
  });
});
