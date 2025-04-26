export type Room = {
	id: number;
	turn: number;
	bestOf: number;
	notes: string;
	banList: {
		name: string;
	};
	players: {
		position: number;
		username: string;
		lps: number;
		score: number;
		team: number;
	}[]
}