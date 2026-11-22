import { describe, expect, it } from 'vitest';
import { formatCountdown } from '@utils/countdown';

const NOW = new Date('2026-11-22T12:00:00Z');

describe('formatCountdown', () => {
	it('counts whole days when the start is two or more days away', () => {
		expect(formatCountdown('2026-12-01T04:00:00Z', NOW)).toBe('in 8 days');
		expect(formatCountdown('2026-11-24T12:00:00Z', NOW)).toBe('in 2 days');
	});

	it('says tomorrow between one and two days away', () => {
		expect(formatCountdown('2026-11-23T20:00:00Z', NOW)).toBe('tomorrow');
	});

	it('counts hours within the last day', () => {
		expect(formatCountdown('2026-11-23T06:00:00Z', NOW)).toBe('in 18 hours');
		expect(formatCountdown('2026-11-22T13:30:00Z', NOW)).toBe('in 1 hour');
	});

	it('says soon within the last hour', () => {
		expect(formatCountdown('2026-11-22T12:40:00Z', NOW)).toBe('very soon');
	});

	it('returns nothing once the start has passed or for an invalid date', () => {
		expect(formatCountdown('2026-11-22T12:00:00Z', NOW)).toBeNull();
		expect(formatCountdown('soon', NOW)).toBeNull();
	});
});
