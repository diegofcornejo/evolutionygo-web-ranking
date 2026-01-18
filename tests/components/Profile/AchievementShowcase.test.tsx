import { render, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import AchievementShowcase from '@components/Profile/AchievementShowcase';
import type { Achievement } from '@types';

const achievements: Achievement[] = [
	{
		id: 'a1',
		icon: 'ic:round-emoji-events',
		name: 'Champion of Season',
		labels: ['Gold'],
		unlockedAt: new Date('2024-01-01T00:00:00Z'),
		description: 'Win the season championship',
		earnedPoints: 500,
		color: '#FFD700',
	},
	{
		id: 'a2',
		icon: 'ic:round-local-fire-department',
		name: 'Hot Streak',
		labels: ['Streak'],
		unlockedAt: new Date('2024-01-02T00:00:00Z'),
		description: 'Win 5 duels in a row',
		earnedPoints: 150,
		color: '#FF6B35',
	},
	{
		id: 'a3',
		icon: 'ic:round-star',
		name: 'Rising Star',
		labels: ['Ranking'],
		unlockedAt: new Date('2024-01-03T00:00:00Z'),
		description: 'Reach Top 100',
		earnedPoints: 200,
		color: '#A855F7',
	},
	{
		id: 'a4',
		icon: 'ic:round-flag',
		name: 'Tournament Victor',
		labels: ['Tournament'],
		unlockedAt: new Date('2024-01-04T00:00:00Z'),
		description: 'Win a tournament',
		earnedPoints: 300,
		color: '#22C55E',
	},
];

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
		const { getByText, container } = render(
			<AchievementShowcase achievements={achievements} />
		);

		const grids = container.querySelectorAll('.grid');
		const previewGrid = grids[0];
		expect(previewGrid).toBeTruthy();

		const previewHeadings = within(previewGrid as HTMLElement).getAllByRole('heading');
		expect(previewHeadings.length).toBe(3);

		const viewAllButton = getByText('View all');
		fireEvent.click(viewAllButton);
		expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
	});
});
