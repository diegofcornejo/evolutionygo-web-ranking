import { describe, it, expect } from 'vitest';
import { formatWinRate, winRateStars } from '@utils/winRate';

describe('formatWinRate', () => {
	it('formats a number with the given digits', () => {
		expect(formatWinRate(71.30177514792899)).toBe('71.30%');
		expect(formatWinRate(71.30177514792899, 1)).toBe('71.3%');
		expect(formatWinRate(0, 0)).toBe('0%');
	});

	it('shows a dash when the API sends no win rate', () => {
		expect(formatWinRate(null)).toBe('—');
		expect(formatWinRate(undefined)).toBe('—');
		expect(formatWinRate(Number.NaN)).toBe('—');
	});
});

describe('winRateStars', () => {
	it('maps 0-100% to 1-5 stars', () => {
		expect(winRateStars(0)).toBe(1);
		expect(winRateStars(50)).toBe(3);
		expect(winRateStars(100)).toBe(5);
	});

	it('treats a missing win rate as zero', () => {
		expect(winRateStars(null)).toBe(1);
		expect(winRateStars(undefined)).toBe(1);
	});
});
