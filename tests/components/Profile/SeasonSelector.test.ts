/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

vi.mock('astro/container', () => ({
	experimental_AstroContainer: {
		create: async () => ({
			renderToString: () => '<div>Season 5 Global</div>',
		}),
	},
}));

// @ts-ignore Astro component import
import SeasonSelector from '@components/Profile/SeasonSelector.astro';

describe('SeasonSelector.astro', () => {
	it('renders season and banlist options', async () => {
		const { experimental_AstroContainer } = await import('astro/container');
		const container = await experimental_AstroContainer.create();
		const result = await container.renderToString(SeasonSelector, {
			props: {
				seasonOptions: ['5', '4'],
				banListOptions: ['Global', 'TCG'],
				currentSeason: '5',
				currentBanlist: 'Global',
				userId: '1',
				username: 'AceDuelist',
			},
		});

		expect(result).toContain('Season 5');
		expect(result).toContain('Global');
	});
});
