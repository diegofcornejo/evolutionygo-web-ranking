import type { Room } from '@types';

type Player = Room['players'][number];

const RANKED_TAG = '(Ranked)';
const DEFAULT_START_LP = 8000;

export const isRoomRanked = (room: Room) => room.notes.includes(RANKED_TAG);

export const teamPlayers = (room: Room, team: number) =>
	room.players.filter((player) => player.team === team);

export const teamLp = (room: Room, team: number) =>
	room.players.find((player) => player.team === team)?.lps ?? 0;

export const teamScore = (room: Room, team: number) =>
	room.players.find((player) => player.team === team)?.score ?? 0;

// The WebSocket feed has no starting LP, so unless the rooms listing supplies
// it, the highest LP on the table is the best reference (covers 16000 LP rooms
// and LP gained above the start).
export const lpBaseline = (room: Room, startLp = DEFAULT_START_LP) =>
	Math.max(startLp, ...room.players.map((player) => player.lps));

export const lpPercent = (lp: number, baseline: number) =>
	baseline > 0 ? Math.min(100, Math.max(0, (lp / baseline) * 100)) : 0;

export const lpTone = (percent: number) => {
	if (percent > 50) return 'bg-success';
	if (percent > 25) return 'bg-warning';
	return 'bg-error';
};

// Notes come as "(Ranked) - SD Max: 15"; the ranked tag gets its own badge.
export const roomNoteTags = (room: Room) =>
	room.notes
		.replace(RANKED_TAG, '')
		.split(/(?:^|\s)-\s+/)
		.map((note) => note.trim())
		.filter(Boolean);

export const duelistHref = (player: Player, banListName: string, season: string) =>
	`/duelists/${player.userId}/${banListName}?username=${player.username}&season=${season}`;
