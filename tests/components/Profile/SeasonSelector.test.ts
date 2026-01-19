/// <reference types="vitest" />
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer } from 'astro/container';
// @ts-ignore Astro component import
import SeasonSelector from '@components/Profile/SeasonSelector.astro';

describe('SeasonSelector.astro', () => {
	it('renders season and banlist options', async () => {
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
