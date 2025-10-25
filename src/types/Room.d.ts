type Player = {
	position: number;
	username: string;
	lps: number;
	score: number;
	team: number;
}

export type Room = {
	id: number;
	turn: number;
	bestOf: number;
	notes: string;
	banList: {
		name: string;
	};
	players: Player[]
}