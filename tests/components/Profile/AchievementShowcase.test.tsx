import { render, fireEvent, within, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import AchievementShowcase, { getRequirementProgress } from '@components/Profile/AchievementShowcase';
import type { Achievement, AchievementCatalogItem, AchievementProgress } from '@types';

const achievements: Achievement[] = [
	{
		awardId: 'award-1',
		id: 1001,
		code: 'first_win',
		icon: '🥇',
		name: 'First victory',
		labels: [],
		unlockedAt: '2026-09-01T10:00:00.000Z',
		description: 'Win your first ranked match',
		earnedPoints: 0,
		season: 7,
	},
	{
		awardId: 'award-2',
		id: 1005,
		code: 'streak_3',
		icon: '🔥',
		name: 'On a roll',
		labels: [],
		unlockedAt: '2026-09-02T10:00:00.000Z',
		description: 'Win 3 ranked matches in a row',
		earnedPoints: 0,
		season: 7,
	},
	{
		awardId: 'award-3',
		id: 1011,
		code: 'format_first_win:TCG',
		icon: '⚔️',
		name: 'First victory in TCG',
		labels: ['TCG'],
		unlockedAt: '2026-09-03T10:00:00.000Z',
		description: 'Win your first ranked match in TCG',
		earnedPoints: 0,
		season: 7,
	},
	{
		awardId: 'award-4',
		id: 2001,
		code: null,
		icon: '🏆',
		name: 'Tournament Victor',
		labels: ['Tournament'],
		unlockedAt: '2026-09-04T10:00:00.000Z',
		description: 'Win a tournament',
		earnedPoints: 300,
		season: 6,
	},
];

const catalog: AchievementCatalogItem[] = [
	{
		id: 1001,
		code: 'first_win',
		icon: '🥇',
		name: 'First victory',
		description: 'Win your first ranked match',
		earnedPoints: 0,
		requirement: { metric: 'rankedWins', target: 1 },
	},
	{
		id: 1002,
		code: 'wins_10',
		icon: '🏅',
		name: 'Veteran I',
		description: 'Win 10 ranked matches',
		earnedPoints: 0,
		requirement: { metric: 'rankedWins', target: 10 },
	},
	{
		id: 1008,
		code: 'matches_100',
		icon: '💯',
		name: 'Centurion',
		description: 'Play 100 ranked matches',
		earnedPoints: 0,
		requirement: { metric: 'rankedMatches', target: 100 },
	},
	{
		id: 1012,
		code: 'format_first_win:OCG',
		icon: '⚔️',
		name: 'First victory in OCG',
		description: 'Win your first ranked match in OCG',
		earnedPoints: 0,
		requirement: { metric: 'ladderFirstWin', target: 1, ladder: 'OCG' },
	},
];

const progress: AchievementProgress = {
	rankedWins: 7,
	rankedMatches: 12,
	currentStreak: 2,
	hasRankedWinByLadder: { TCG: true, OCG: false, Edison: false, JTP: false, Genesys: false },
};

describe('AchievementShowcase', () => {
	beforeAll(() => {
		Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
			value: vi.fn(),
			configurable: true,
		});
		Object.defineProperty(HTMLDialogElement.prototype, 'close', {
			value: vi.fn(),
			configurable: true,
		});
	});

	it('shows only three achievements and opens modal', () => {
		const { getByText, container } = render(<AchievementShowcase achievements={achievements} />);

		const grids = container.querySelectorAll('.grid');
		const previewGrid = grids[0];
		expect(previewGrid).toBeTruthy();

		const previewHeadings = within(previewGrid as HTMLElement).getAllByRole('heading');
		expect(previewHeadings.length).toBe(3);

		const viewAllButton = getByText('View all');
		fireEvent.click(viewAllButton);
		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
	});

	it('counts unlocked against the catalog and lists locked ones with progress', () => {
		render(<AchievementShowcase achievements={achievements} catalog={catalog} progress={progress} />);

		expect(screen.getByText('/ 7', { exact: false })).toBeInTheDocument();
		expect(screen.getByText('Veteran I')).toBeInTheDocument();
		expect(screen.getByText('7 / 10')).toBeInTheDocument();
		expect(screen.getByText('12 / 100')).toBeInTheDocument();
		expect(screen.getAllByText('First victory')).toHaveLength(2);
	});

	it('hides zero points and shows earned ones', () => {
		render(<AchievementShowcase achievements={achievements} />);

		expect(screen.queryByText('+0 pts')).not.toBeInTheDocument();
		expect(screen.getAllByText('+300 pts').length).toBeGreaterThan(0);
		expect(screen.getByText('Achievement Points')).toBeInTheDocument();
	});

	it('shows catalog achievements to unlock when the player has none', () => {
		render(<AchievementShowcase achievements={[]} catalog={catalog} progress={progress} />);

		expect(screen.getByText('No Achievements Yet')).toBeInTheDocument();
		expect(screen.getByText('Achievements you can unlock:')).toBeInTheDocument();
		expect(screen.getByText('Veteran I')).toBeInTheDocument();
	});
});

describe('getRequirementProgress', () => {
	it('reads counters and clamps them to the target', () => {
		expect(getRequirementProgress(catalog[1], { ...progress, rankedWins: 40 })).toEqual({ current: 10, target: 10 });
	});

	it('reads the ladder first-win flag', () => {
		expect(getRequirementProgress(catalog[3], progress)).toEqual({ current: 0, target: 1 });
	});

	it('returns nulls for unmeasurable requirements', () => {
		expect(getRequirementProgress({ ...catalog[0], requirement: null }, progress)).toEqual({
			current: null,
			target: null,
		});
	});
});
