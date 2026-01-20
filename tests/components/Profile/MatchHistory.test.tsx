import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MatchHistory from '@components/Profile/MatchHistory';
import type { Match } from '@types';

const pvpMatch: Match = {
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
};

const tagMatch: Match = {
	userId: '1',
	bestOf: 1,
	banListName: 'Global',
	playerNames: ['AceDuelist', 'Partner'],
	opponentNames: ['RivalTwo', 'RivalThree'],
	playerScore: 0,
	opponentScore: 1,
	points: -12,
	winner: false,
	date: new Date('2024-01-09T10:00:00Z').toISOString(),
	season: 5,
};

const matches: Match[] = [pvpMatch, tagMatch];

describe('MatchHistory', () => {
	it('shows empty state when no matches', () => {
		const { getByText } = render(<MatchHistory matches={[]} />);

		expect(getByText('No Matches Yet')).toBeTruthy();
		expect(getByText('Start dueling to build your match history.')).toBeTruthy();
	});

	it('filters matches by wins', () => {
		const { getByText, queryByText } = render(
			<MatchHistory matches={matches} />
		);

		expect(getByText(/RivalOne/)).toBeTruthy();
		expect(getByText(/RivalTwo/)).toBeTruthy();

		fireEvent.click(getByText('Wins'));
		expect(getByText(/RivalOne/)).toBeTruthy();
		expect(queryByText(/RivalTwo/)).toBeNull();
	});

	it('filters matches by losses', () => {
		const { getByText, queryByText } = render(
			<MatchHistory matches={matches} />
		);

		fireEvent.click(getByText('Losses'));
		expect(queryByText(/RivalOne/)).toBeNull();
		expect(getByText(/RivalTwo/)).toBeTruthy();
	});

	it('filters matches by PvP type', () => {
		const { getByText, queryByText } = render(
			<MatchHistory matches={matches} />
		);

		fireEvent.click(getByText('PvP'));
		expect(getByText(/RivalOne/)).toBeTruthy();
		expect(queryByText(/RivalTwo/)).toBeNull();
	});

	it('filters matches by TAG type', () => {
		const { getByRole, queryByText, getByText } = render(
			<MatchHistory matches={matches} />
		);

		// Find the TAG filter button specifically
		const tagButton = getByRole('button', { name: /^TAG/ });
		fireEvent.click(tagButton);
		expect(queryByText(/RivalOne/)).toBeNull();
		expect(getByText(/RivalTwo/)).toBeTruthy();
	});

	it('searches matches by opponent name', () => {
		const { getByText, getByPlaceholderText, queryByText } = render(
			<MatchHistory matches={matches} />
		);

		const searchInput = getByPlaceholderText('Search opponent...');
		fireEvent.change(searchInput, { target: { value: 'RivalOne' } });

		expect(getByText(/RivalOne/)).toBeTruthy();
		expect(queryByText(/RivalTwo/)).toBeNull();
	});
});
