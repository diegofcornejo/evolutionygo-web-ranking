export type TierId = 'rookie' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export type TierProgress = {
	nextTierId: TierId;
	unit: 'points' | 'games';
	current: number;
	target: number;
	distinctOpponentWins: { current: number; required: number } | null;
};

export type DuelistTier = {
	id: TierId;
	name: string;
	effectivePoints?: number;
	gamesPlayed?: number;
	progress?: TierProgress | null;
	rating?: number;
	peak?: number;
};

/** One entry of the ladder catalog from /ranked-tiers. */
export type RankedTier = {
	id: TierId;
	name: string;
	order: number;
	kind: 'placement' | 'absolute' | 'relative';
	threshold: number | null;
	minGames: number | null;
	distinctOpponentWins: number | null;
	requiresTier: TierId | null;
	size: number | null;
};

/** One entry of ratings[] from /users/{id}/stats: a banlist or a group of banlists. */
export type DuelistRating = {
	banListName: string;
	rankType?: string;
	rating?: number;
	peak?: number;
	gamesPlayed?: number;
	provisional?: boolean;
	tier?: DuelistTier | null;
};

export type Duelist = {
	userId: string;
	username: string;
	points: number;
	wins: number;
	losses: number;
	winRate: number | null;
	position: number;
	borderColor?: 'transparent' | 'gold' | 'silver' | 'bronze';
	rating?: number | null;
	peak?: number | null;
	provisional?: boolean | null;
	tier?: DuelistTier | null;
}
