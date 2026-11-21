import { describe, it, expect } from 'vitest';
import type { DuelistTier } from '@types';
import { cardLevel, otherRanks, parseTierLadder, tierForBanList, tierProgressView } from '@utils/tier';

// The live /ranked-tiers ladder (2026-11-21).
const LADDER_PAYLOAD = {
  banListName: null,
  dailyOpponentCap: 2,
  dayBoundary: 'UTC',
  tiers: [
    { id: 'master', name: 'Master', order: 6, kind: 'relative', icon: 'tier-master', threshold: null, minGames: 20, distinctOpponentWins: null, requiresTier: 'platinum', size: 5 },
    { id: 'rookie', name: 'Rookie', order: 0, kind: 'placement', icon: 'tier-rookie', threshold: null, minGames: 5, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'bronze', name: 'Bronze', order: 1, kind: 'absolute', icon: 'tier-bronze', threshold: null, minGames: null, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'silver', name: 'Silver', order: 2, kind: 'absolute', icon: 'tier-silver', threshold: 3, minGames: null, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'gold', name: 'Gold', order: 3, kind: 'absolute', icon: 'tier-gold', threshold: 10, minGames: null, distinctOpponentWins: null, requiresTier: null, size: null },
    { id: 'platinum', name: 'Platinum', order: 4, kind: 'absolute', icon: 'tier-platinum', threshold: 25, minGames: null, distinctOpponentWins: 5, requiresTier: null, size: null },
    { id: 'diamond', name: 'Diamond', order: 5, kind: 'absolute', icon: 'tier-diamond', threshold: 40, minGames: null, distinctOpponentWins: 5, requiresTier: null, size: null },
  ],
};
const ladder = parseTierLadder(LADDER_PAYLOAD)!;

const gold: DuelistTier = {
  id: 'gold',
  name: 'Gold',
  effectivePoints: 17,
  gamesPlayed: 61,
  progress: { nextTierId: 'platinum', unit: 'points', current: 17, target: 25, distinctOpponentWins: { current: 24, required: 5 } },
};

describe('cardLevel', () => {
  it('uses the tier order on ladders', () => {
    expect(cardLevel({ tier: { id: 'rookie', name: 'Rookie' }, winRate: 10 })).toBe(1);
    expect(cardLevel({ tier: { id: 'diamond', name: 'Diamond' }, winRate: 10 })).toBe(6);
    expect(cardLevel({ tier: { id: 'master', name: 'Master' }, winRate: 10 })).toBe(7);
  });

  it('falls back to win-rate stars for a tier id it does not know', () => {
    expect(cardLevel({ tier: { id: 'legend', name: 'Legend' } as never, winRate: 71.3 })).toBe(3);
    expect(cardLevel({ tier: { id: 'constructor', name: 'Odd' } as never, winRate: 100 })).toBe(5);
  });

  it('falls back to win-rate stars in Global', () => {
    expect(cardLevel({ tier: null, winRate: 71.3 })).toBe(3);
    expect(cardLevel({ tier: null, winRate: 100 })).toBe(5);
    expect(cardLevel({ winRate: null })).toBe(1);
  });
});

describe('tierForBanList', () => {
  const ratings = [
    { banListName: '2026.10 TCG', rankType: 'banlist', rating: 1074, tier: gold },
    { banListName: 'TCG', rankType: 'group', rating: 1129, peak: 1193, tier: { id: 'master' as const, name: 'Master', progress: null } },
  ];

  it('picks the rating entry for the banlist', () => {
    expect(tierForBanList(ratings, 'TCG')?.rating).toBe(1129);
    expect(tierForBanList(ratings, '2026.10 TCG')?.tier?.id).toBe('gold');
    expect(tierForBanList(ratings, 'OCG')).toBeNull();
  });

  it('returns null without ratings', () => {
    expect(tierForBanList(undefined, 'TCG')).toBeNull();
    expect(tierForBanList([], 'TCG')).toBeNull();
  });
});

describe('parseTierLadder', () => {
  it('parses and sorts the ladder', () => {
    expect(ladder.map((tier) => tier.id)).toEqual(['rookie', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']);
    expect(ladder[4]).toMatchObject({ name: 'Platinum', kind: 'absolute', threshold: 25, distinctOpponentWins: 5 });
  });

  it('rejects an invalid ladder', () => {
    expect(parseTierLadder(null)).toBeNull();
    expect(parseTierLadder({})).toBeNull();
    expect(parseTierLadder({ tiers: [] })).toBeNull();
    expect(parseTierLadder({ tiers: [{ name: 'No id' }] })).toBeNull();
  });
});

describe('tierProgressView', () => {
  it('builds points progress', () => {
    expect(tierProgressView(gold, ladder)).toMatchObject({ kind: 'points', current: 17, target: 25, remaining: 8, percent: 68, nextName: 'Platinum' });
  });

  it('builds placement progress', () => {
    const rookie: DuelistTier = { id: 'rookie', name: 'Rookie', progress: { nextTierId: 'bronze', unit: 'games', current: 3, target: 5, distinctOpponentWins: null } };
    expect(tierProgressView(rookie, ladder)).toMatchObject({ kind: 'games', current: 3, target: 5, remaining: 2, percent: 60, nextName: 'Bronze', distinct: null });
  });

  it('clamps the bar for negative rank points', () => {
    const bronze: DuelistTier = { id: 'bronze', name: 'Bronze', progress: { nextTierId: 'silver', unit: 'points', current: -1, target: 3, distinctOpponentWins: null } };
    expect(tierProgressView(bronze, ladder)).toMatchObject({ kind: 'points', current: -1, remaining: 4, percent: 0 });
    const over: DuelistTier = { id: 'bronze', name: 'Bronze', progress: { nextTierId: 'silver', unit: 'points', current: 5, target: 3, distinctOpponentWins: null } };
    expect(tierProgressView(over, ladder)).toMatchObject({ remaining: 0, percent: 100 });
  });

  it('shows top N for master', () => {
    expect(tierProgressView({ id: 'master', name: 'Master', progress: null }, ladder)).toEqual({ kind: 'top', size: 5, distinct: null });
    expect(tierProgressView({ id: 'master', name: 'Master', progress: null }, null)).toEqual({ kind: 'top', size: null, distinct: null });
  });

  it('describes the relative step to master', () => {
    expect(tierProgressView({ id: 'diamond', name: 'Diamond', progress: null }, ladder)).toEqual({
      kind: 'relative',
      nextName: 'Master',
      size: 5,
      minGames: 20,
      distinct: null,
    });
    expect(tierProgressView({ id: 'diamond', name: 'Diamond', progress: null }, null)).toMatchObject({ kind: 'relative', nextName: 'Master', size: null });
  });

  it('marks the distinct-opponents requirement', () => {
    expect(tierProgressView(gold, ladder).distinct).toEqual({ current: 24, required: 5, met: true });
    const short: DuelistTier = { ...gold, progress: { ...gold.progress!, distinctOpponentWins: { current: 3, required: 5 } } };
    expect(tierProgressView(short, null)).toMatchObject({ nextName: 'Platinum', distinct: { current: 3, required: 5, met: false } });
  });
});

describe('otherRanks', () => {
  const diamond = (gamesPlayed: number, effectivePoints: number) => ({ id: 'diamond' as const, name: 'Diamond', gamesPlayed, effectivePoints, progress: null });
  const edisonBanlist = { banListName: '2010.03 Edison', rankType: 'banlist', tier: diamond(40, 45) };
  const edisonGroup = { banListName: 'Edison', rankType: 'group', members: ['2010.03 Edison'], tier: diamond(40, 45) };
  const tcg = { banListName: 'TCG', rankType: 'group', tier: { id: 'gold' as const, name: 'Gold', gamesPlayed: 12, effectivePoints: 11 } };

  it('drops the rank the card already shows, even under its other name', () => {
    expect(otherRanks([edisonBanlist, edisonGroup, tcg], edisonGroup).map((rank) => rank.banListName)).toEqual(['TCG']);
    expect(otherRanks([edisonBanlist, edisonGroup, tcg], edisonBanlist).map((rank) => rank.banListName)).toEqual(['TCG']);
  });

  it('lists a group and its single member once, as the group', () => {
    expect(otherRanks([edisonBanlist, edisonGroup, tcg], null).map((rank) => rank.banListName)).toEqual(['Edison', 'TCG']);
  });

  it('keeps different ranks that only share a tier name', () => {
    const goldA = { banListName: 'A', tier: { id: 'gold' as const, name: 'Gold' } };
    const goldB = { banListName: 'B', tier: { id: 'gold' as const, name: 'Gold' } };
    expect(otherRanks([goldA, goldB], null)).toHaveLength(2);
  });

  it('skips malformed and untiered entries', () => {
    const junk = [null, 'x', { banListName: 3 }, { banListName: 'OCG', tier: null }, { banListName: 'Odd', tier: { name: 'No id' } }, tcg];
    expect(otherRanks(junk as never, null).map((rank) => rank.banListName)).toEqual(['TCG']);
    expect(otherRanks(undefined, null)).toEqual([]);
  });
});

describe('robustness', () => {
  it('finds the banlist rating among malformed entries', () => {
    expect(tierForBanList([null, { banListName: 'TCG', rating: 1 }] as never, 'TCG')?.rating).toBe(1);
  });

  it('treats a malformed progress as no progress', () => {
    const broken = { id: 'gold' as const, name: 'Gold', progress: { unit: 'points', current: 'x', target: 25 } } as never;
    expect(tierProgressView(broken, null).kind).toBe('none');
    const noNext = { id: 'gold' as const, name: 'Gold', progress: { unit: 'points', current: 3, target: 25, distinctOpponentWins: null } } as never;
    expect(tierProgressView(noNext, null).kind).toBe('none');
  });
});
