import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatsOverview from '@components/Profile/StatsOverview';

describe('StatsOverview', () => {
	it('shows Top 3 Player for position <= 3', () => {
		const { getByText } = render(
			<StatsOverview
				wins={10}
				losses={5}
				winRate={66.67}
				points={500}
				position={2}
			/>
		);

		expect(getByText('Top 3 Player')).toBeTruthy();
		expect(getByText('#2')).toBeTruthy();
	});

	it('shows Top 10 Player for position 4-10', () => {
		const { getByText } = render(
			<StatsOverview
				wins={10}
				losses={5}
				winRate={66.67}
				points={300}
				position={7}
			/>
		);

		expect(getByText('Top 10 Player')).toBeTruthy();
		expect(getByText('#7')).toBeTruthy();
	});

	it('shows Top 20 Player for position 11-20', () => {
		const { getByText } = render(
			<StatsOverview
				wins={10}
				losses={10}
				winRate={50}
				points={100}
				position={15}
			/>
		);

		expect(getByText('Top 20 Player')).toBeTruthy();
		expect(getByText('5.0 per game')).toBeTruthy();
	});

	it('shows Ranked Player for position > 20', () => {
		const { getByText } = render(
			<StatsOverview
				wins={5}
				losses={10}
				winRate={33.33}
				points={50}
				position={50}
			/>
		);

		expect(getByText('Ranked Player')).toBeTruthy();
		expect(getByText('#50')).toBeTruthy();
	});
});
