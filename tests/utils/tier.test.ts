import { describe, it, expect } from 'vitest';
import { cardLevel } from '@utils/tier';

describe('cardLevel', () => {
  it('uses the tier order on ladders', () => {
    expect(cardLevel({ tier: { id: 'rookie', name: 'Rookie' }, winRate: 10 })).toBe(1);
    expect(cardLevel({ tier: { id: 'diamond', name: 'Diamond' }, winRate: 10 })).toBe(6);
    expect(cardLevel({ tier: { id: 'master', name: 'Master' }, winRate: 10 })).toBe(7);
  });

  it('falls back to win-rate stars in Global', () => {
    expect(cardLevel({ tier: null, winRate: 71.3 })).toBe(3);
    expect(cardLevel({ tier: null, winRate: 100 })).toBe(5);
    expect(cardLevel({ winRate: null })).toBe(1);
  });
});
