import type { DuelistRating, DuelistTier, RankedTier, TierId } from '@types';
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

const isRating = (value: unknown): value is DuelistRating =>
	!!value && typeof value === 'object' && typeof (value as DuelistRating).banListName === 'string';

const hasTier = (rating: DuelistRating): rating is DuelistRating & { tier: DuelistTier } =>
	!!rating.tier && typeof rating.tier === 'object' && typeof rating.tier.id === 'string';

/** The ratings[] entry (banlist or group) that matches the banlist a profile is showing. */
export const tierForBanList = (ratings: DuelistRating[] | undefined, banListName: string): DuelistRating | null =>
	(Array.isArray(ratings) ? ratings : []).find((rating) => isRating(rating) && rating.banListName === banListName) ?? null;

// A group with one member is sent twice, as the group and as the banlist, with the same numbers.
const sameRank = (a: DuelistTier, b: DuelistTier) =>
	a.id === b.id &&
	typeof a.gamesPlayed === 'number' &&
	a.gamesPlayed === b.gamesPlayed &&
	typeof a.effectivePoints === 'number' &&
	a.effectivePoints === b.effectivePoints;

/** The player's other tiered ranks, without the one already shown and without group/member duplicates. */
export const otherRanks = (
	ratings: DuelistRating[] | undefined,
	current: DuelistRating | null,
): (DuelistRating & { tier: DuelistTier })[] => {
	const currentTier = current && hasTier(current) ? current.tier : null;
	const ranks: (DuelistRating & { tier: DuelistTier })[] = [];

	for (const rating of Array.isArray(ratings) ? ratings : []) {
		if (!isRating(rating) || !hasTier(rating)) continue;
		if (current && rating.banListName === current.banListName) continue;
		if (currentTier && sameRank(rating.tier, currentTier)) continue;

		const twin = ranks.findIndex((rank) => rank.banListName === rating.banListName || sameRank(rank.tier, rating.tier));
		if (twin === -1) ranks.push(rating);
		else if (rating.rankType === 'group' && ranks[twin].rankType !== 'group') ranks[twin] = rating;
	}
	return ranks;
};

const KINDS = new Set(['placement', 'absolute', 'relative']);
const toNumberOrNull = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

/** The /ranked-tiers payload as a ladder sorted from Rookie to Master, or null when it is unusable. */
export const parseTierLadder = (payload: unknown): RankedTier[] | null => {
	const tiers = (payload as { tiers?: unknown } | null)?.tiers;
	if (!Array.isArray(tiers) || tiers.length === 0) return null;

	const ladder: RankedTier[] = [];
	for (const raw of tiers as Record<string, unknown>[]) {
		if (!raw || typeof raw.id !== 'string' || typeof raw.name !== 'string' || typeof raw.order !== 'number') return null;
		ladder.push({
			id: raw.id as TierId,
			name: raw.name,
			order: raw.order,
			kind: (KINDS.has(raw.kind as string) ? raw.kind : 'absolute') as RankedTier['kind'],
			threshold: toNumberOrNull(raw.threshold),
			minGames: toNumberOrNull(raw.minGames),
			distinctOpponentWins: toNumberOrNull(raw.distinctOpponentWins),
			requiresTier: typeof raw.requiresTier === 'string' ? (raw.requiresTier as TierId) : null,
			size: toNumberOrNull(raw.size),
		});
	}
	return ladder.sort((a, b) => a.order - b.order);
};

type Distinct = { current: number; required: number; met: boolean } | null;

export type TierProgressView = { distinct: Distinct } & (
	| { kind: 'points' | 'games'; current: number; target: number; remaining: number; percent: number; nextName: string }
	| { kind: 'top'; size: number | null }
	| { kind: 'relative'; nextName: string; size: number | null; minGames: number | null }
	| { kind: 'none' }
);

const capitalize = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);

const tierName = (id: string, ladder: RankedTier[] | null) => ladder?.find((tier) => tier.id === id)?.name ?? capitalize(id);

/** What the profile shows under the tier: a bar towards the next tier, Master's "top N", or the step to Master. */
export const tierProgressView = (tier: DuelistTier, ladder: RankedTier[] | null): TierProgressView => {
	const progress = tier.progress;
	const usable =
		!!progress &&
		typeof progress.nextTierId === 'string' &&
		Number.isFinite(progress.current) &&
		Number.isFinite(progress.target);

	if (progress && usable) {
		const { current, target } = progress;
		const percent = target > 0 ? Math.round(Math.min(100, Math.max(0, (current / target) * 100))) : 100;
		const distinct = progress.distinctOpponentWins
			? { ...progress.distinctOpponentWins, met: progress.distinctOpponentWins.current >= progress.distinctOpponentWins.required }
			: null;
		return {
			kind: progress.unit === 'games' ? 'games' : 'points',
			current,
			target,
			remaining: Math.max(0, target - current),
			percent,
			nextName: tierName(progress.nextTierId, ladder),
			distinct,
		};
	}

	const master = ladder?.find((step) => step.kind === 'relative') ?? null;
	if (tier.id === 'master') return { kind: 'top', size: master?.size ?? null, distinct: null };
	if (tier.id === 'diamond') {
		return { kind: 'relative', nextName: master?.name ?? 'Master', size: master?.size ?? null, minGames: master?.minGames ?? null, distinct: null };
	}
	return { kind: 'none', distinct: null };
};
