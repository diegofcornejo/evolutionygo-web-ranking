/// <reference types="vitest" />
/// <reference types="astro/client" />
import { describe, it, expect, vi } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import svelteRenderer from '@astrojs/svelte/server.js';
import { experimental_AstroContainer } from 'astro/container';

vi.mock('@layouts/Layout.astro', async () => ({
  default: (await import('../__mocks__/Layout.astro')).default,
}));

vi.mock('@sections/Watch.svelte', async () => ({
  default: (await import('../__mocks__/SimpleSvelte.svelte')).default,
}));

vi.mock('@components/RoomsWebSocketListener', async () => ({
  RoomsWebSocketListener: (await import('../__mocks__/SimpleReact')).default,
}));

const renderWatchPage = async (url: string) => {
  const WatchPage = (await import('@pages/watch.astro')).default;

  const container = await experimental_AstroContainer.create();
  container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
  container.addServerRenderer({ name: '@astrojs/svelte', renderer: svelteRenderer });
  container.addClientRenderer({ name: '@astrojs/react', entrypoint: '@astrojs/react/client.js' });
  container.addClientRenderer({ name: '@astrojs/svelte', entrypoint: '@astrojs/svelte/client.js' });

  return container.renderToString(WatchPage, { request: new Request(url) });
};

describe('watch.astro page', () => {
  it('renders the watch section and the rooms listener', async () => {
    const result = await renderWatchPage('https://evolutionygo.com/watch');

    expect(result).toContain('Watch Live Duels');
    expect(result).toContain('component-url="@sections/Watch.svelte"');
    expect(result).toContain('MockSvelteSection');
    expect(result).toContain('component-url="@components/RoomsWebSocketListener"');
  });

  it('passes a requested room id down to the section', async () => {
    const result = await renderWatchPage('https://evolutionygo.com/watch?room=9775');

    expect(result).toContain('initialRoomId&quot;:[0,9775]');
  });

  it('ignores a room id that is not a positive integer', async () => {
    const result = await renderWatchPage('https://evolutionygo.com/watch?room=not-a-room');

    expect(result).toContain('initialRoomId&quot;:[0,null]');
    expect(result).not.toContain('not-a-room');
  });
});
