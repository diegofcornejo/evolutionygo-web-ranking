import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsOverview from '@components/Profile/StatsOverview';

describe('StatsOverview', () => {
	it('shows average points per game and ranking tier', () => {
		const { getByText } = render(
			<StatsOverview
				wins={10}
				losses={10}
				winRate={50}
				points={100}
				position={11}
			/>
		);

		expect(getByText('Total Points')).toBeTruthy();
		expect(getByText('5.0 per game')).toBeTruthy();
		expect(getByText('Top 20 Player')).toBeTruthy();
	});
});
