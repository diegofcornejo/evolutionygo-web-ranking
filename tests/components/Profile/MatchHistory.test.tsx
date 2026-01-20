import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MatchHistory from '@components/Profile/MatchHistory';
import type { Match } from '@types';

const matches: Match[] = [
	{
		userId: '1',
		bestOf: 3,
		banListName: 'Global',
		playerNames: ['AceDuelist'],
		opponentNames: ['RivalOne'],
		playerScore: 2,
		opponentScore: 1,
		points: 25,
		winner: true,
		date: new Date('2024-01-10T10:00:00Z').toISOString(),
		season: 5,
	},
	{
		userId: '1',
		bestOf: 1,
		banListName: 'Global',
		playerNames: ['AceDuelist'],
		opponentNames: ['RivalTwo'],
		playerScore: 0,
		opponentScore: 1,
		points: -12,
		winner: false,
		date: new Date('2024-01-09T10:00:00Z').toISOString(),
		season: 5,
	},
];

describe('MatchHistory', () => {
	it('filters matches by wins', () => {
		const { getByText, queryByText } = render(
			<MatchHistory matches={matches} />
		);

		// Check both matches are visible (search by opponent name)
		expect(getByText(/RivalOne/)).toBeTruthy();
		expect(getByText(/RivalTwo/)).toBeTruthy();

		// Filter by wins
		fireEvent.click(getByText('Wins'));
		expect(getByText(/RivalOne/)).toBeTruthy();
		expect(queryByText(/RivalTwo/)).toBeNull();
	});
});
