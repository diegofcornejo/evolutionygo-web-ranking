export type WatchRoomPlayer = {
	name: string;
	position: number;
	team: number;
};

/**
 * A room as published by the duel server rooms listing
 * (`GET https://rooms.server.evolutionygo.com/api/rooms`).
 *
 * Shape and field meanings come from the "Embedding live Evolution duels"
 * guide. It is not the same shape as the WebSocket `Room`: this listing is the
 * only source that says whether a room admits spectators.
 */
export type WatchRoom = {
	id: number;
	status: string;
	started: boolean;
	private: boolean;
	canWatch: boolean;
	league: string;
	banlist: string;
	rule: string;
	bestOf: number;
	startLp: number;
	timeLimit: number;
	players: WatchRoomPlayer[];
	maxPlayers: number;
	spectators: number;
	ranked?: boolean;
	canPlay?: boolean;
	command?: string;
};
