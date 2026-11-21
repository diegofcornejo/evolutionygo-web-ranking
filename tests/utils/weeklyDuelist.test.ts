import { describe, it, expect } from 'vitest';
import { formatWeekRange, parseWeeklyDuelist } from '@utils/weeklyDuelist';

const item = {
  userId: 'c13',
  username: 'Fuku',
  points: '27',
  wins: '19',
  losses: '5',
  from: '2026-11-09T00:00:00.000Z',
  to: '2026-11-15T00:00:00.000Z',
};

describe('parseWeeklyDuelist', () => {
  it('parses the first weekly item', () => {
    const parsed = parseWeeklyDuelist([item]);

    expect(parsed?.duelist).toMatchObject({ userId: 'c13', username: 'Fuku', points: 27, wins: 19, losses: 5 });
    expect(parsed?.duelist.winRate).toBeCloseTo(79.17, 1);
    expect(parsed?.from).toBe('2026-11-09T00:00:00.000Z');
    expect(parsed?.to).toBe('2026-11-15T00:00:00.000Z');
  });

  it('returns null for an empty or invalid payload', () => {
    expect(parseWeeklyDuelist([])).toBeNull();
    expect(parseWeeklyDuelist({})).toBeNull();
    expect(parseWeeklyDuelist(null)).toBeNull();
    expect(parseWeeklyDuelist([{ username: 'NoId' }])).toBeNull();
  });

  it('parses string counts and guards bad numbers', () => {
    const parsed = parseWeeklyDuelist([{ ...item, points: 'x', wins: '0', losses: '0' }]);

    expect(parsed?.duelist.points).toBe(0);
    expect(parsed?.duelist.winRate).toBeNull();
  });
});

describe('formatWeekRange', () => {
  it('formats the week range in UTC', () => {
    expect(formatWeekRange('2026-11-09T00:00:00.000Z', '2026-11-15T00:00:00.000Z')).toBe('Nov 9 – Nov 15');
  });
});
