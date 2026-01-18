import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfileHeader from '@components/Profile/ProfileHeader';

describe('ProfileHeader', () => {
	it('renders champion badge and core stats', () => {
		const { getByText } = render(
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
			/>
		);

		expect(getByText('AceDuelist')).toBeTruthy();
		expect(getByText('Champion')).toBeTruthy();
		expect(getByText('Rank #1')).toBeTruthy();
		expect(getByText('Points')).toBeTruthy();
		expect(getByText('Wins')).toBeTruthy();
		expect(getByText('Losses')).toBeTruthy();
	});
});
