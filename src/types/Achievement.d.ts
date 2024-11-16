export type Achievement = {
	id: string;
	icon: string;
	name: string;
	labels: string[];
	unlockedAt: Date;
	description: string;
	earnedPoints: number;
	color?: string;
};