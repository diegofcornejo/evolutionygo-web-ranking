export type Duelist = {
	userId: number;
	username: string;
	points: number;
	wins: number;
	losses: number;
	winRate: number;
	position: number;
	borderColor?: 'transparent' | 'gold' | 'silver' | 'bronze';
}