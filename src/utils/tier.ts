import type { DuelistTier, TierId } from '@types';
import { winRateStars } from '@utils/winRate';

const TIER_LEVEL: Record<TierId, number> = {
	rookie: 1,
	bronze: 2,
	silver: 3,
	gold: 4,
	platinum: 5,
	diamond: 6,
	master: 7,
};

// Ladders carry a ranked tier; Global has none, so its level comes from the win rate.
export const cardLevel = (duelist: { tier?: DuelistTier | null; winRate: number | null }): number =>
	duelist.tier ? TIER_LEVEL[duelist.tier.id] : Math.floor(winRateStars(duelist.winRate));
