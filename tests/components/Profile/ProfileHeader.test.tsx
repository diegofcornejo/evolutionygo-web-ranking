import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfileHeader from '@components/Profile/ProfileHeader';

describe('ProfileHeader', () => {
	it('renders champion badge and core stats', () => {
		const { getByText, getAllByText } = render(
			<ProfileHeader
				userId="1"
				username="AceDuelist"
				points={1200}
				wins={183}
				losses={127}
				winRate={59.0}
				position={1}
				season="5"
				banlistName="Global"
				seasonStats={[
					{ season: 3, points: 800, wins: 120, losses: 90 },
					{ season: 4, points: 1000, wins: 150, losses: 110 },
					{ season: 5, points: 1200, wins: 183, losses: 127 },
				]}
			/>
		);

		expect(getByText('AceDuelist')).toBeTruthy();
		expect(getByText('Champion')).toBeTruthy();
		expect(getByText('Rank #1')).toBeTruthy();
		expect(getAllByText('Points')[0]).toBeTruthy();
		expect(getAllByText('Wins')[0]).toBeTruthy();
		expect(getAllByText('Losses')[0]).toBeTruthy();
	});
});
