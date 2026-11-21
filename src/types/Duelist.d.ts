export type TierId = 'rookie' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';

export type DuelistTier = {
	id: TierId;
	name: string;
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
