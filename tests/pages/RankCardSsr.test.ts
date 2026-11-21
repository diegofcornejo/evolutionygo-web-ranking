/// <reference types="astro/client" />
import { describe, it, expect } from 'vitest';
import reactRenderer from '@astrojs/react/server.js';
import svelteRenderer from '@astrojs/svelte/server.js';
import { experimental_AstroContainer } from 'astro/container';
import RankCardHost from '../__mocks__/RankCardHost.astro';

// The site loads both the React and Svelte renderers. With two candidates, Astro refuses to
// server-render a React component that returns null, so the card has to render something.
describe('RankCard server rendering with every renderer the site uses', () => {
	it('renders a profile with no ranks instead of failing the whole page', async () => {
		const container = await experimental_AstroContainer.create();
		container.addServerRenderer({ name: '@astrojs/react', renderer: reactRenderer });
		container.addServerRenderer({ name: '@astrojs/svelte', renderer: svelteRenderer });

		const html = await container.renderToString(RankCardHost, {
			props: { rating: null, others: [], ladder: null, season: '7', banListName: 'Global', userId: '1', username: 'Ace' },
		});

		expect(html).toContain('<main>');
		expect(html).not.toContain('data-rank-card');
	});
});
