export type Achievement = {
	awardId?: string;
	id: number;
	code: string | null;
	icon: string;
	name: string;
	labels: string[];
	unlockedAt: string;
	description: string;
	earnedPoints: number;
	season?: number;
};

export type AchievementMetric = 'rankedWins' | 'rankedMatches' | 'currentStreak' | 'ladderFirstWin';

export type AchievementRequirement = {
	metric: AchievementMetric;
	target: number;
	ladder?: string;
};

export type AchievementCatalogItem = {
	id: number;
	code: string;
	icon: string;
	name: string;
	description: string;
	earnedPoints: number;
	requirement: AchievementRequirement | null;
};

export type AchievementCatalog = {
	version: string;
	items: AchievementCatalogItem[];
};

export type AchievementProgress = {
	rankedWins: number;
	rankedMatches: number;
	currentStreak: number;
	hasRankedWinByLadder: Record<string, boolean>;
};

export type AchievementRecord = {
	userId: string;
	asOf: string;
	scope: 'lifetime-ranked';
	achievements: Achievement[];
	progress: AchievementProgress;
};
