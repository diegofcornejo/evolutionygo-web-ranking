/**
 * Watch links for embedding live Evolution duels.
 *
 * A public duel is shown as a spectator view by pointing an iframe at a watch
 * URL on the game client. No account, API key or handshake is involved: the
 * frame joins as a spectator, replays the duel so far and then follows it live.
 *
 * Parameters are read once per load, so `board` is fixed for the life of a
 * frame — switching renderer means creating a new frame.
 */
import type { WatchRoom } from '@types';

export type BoardRenderer = '2d' | '3d';

export type WatchUrlOptions = {
	embed?: boolean;
	board?: BoardRenderer;
	mute?: boolean;
};

const DEFAULT_GAME_CLIENT_URL = 'https://evoduel.com';
const DEFAULT_ROOMS_API_URL = 'https://rooms.server.evolutionygo.com/api/rooms';

/** Trailing slashes are stripped so the watch URL keeps exactly one. */
export const resolveGameClientUrl = (configured?: string) =>
	(configured || DEFAULT_GAME_CLIENT_URL).replace(/\/+$/, '');

export const resolveRoomsApiUrl = (configured?: string) => configured || DEFAULT_ROOMS_API_URL;

export const gameClientUrl = () => resolveGameClientUrl(import.meta.env.PUBLIC_GAME_CLIENT_URL);

export const roomsApiUrl = () => resolveRoomsApiUrl(import.meta.env.PUBLIC_ROOMS_API_URL);

/** Only a positive integer is a room id; anything else is "room not found". */
export const isValidRoomId = (roomId: unknown): boolean => {
	const id = Number(roomId);
	return Number.isInteger(id) && id > 0;
};

/**
 * A room can be embedded only when it needs no password, admits spectators and
 * does not require a logged-in viewer (`verified` league).
 */
export const isWatchableRoom = (room: WatchRoom): boolean =>
	!room.private && room.canWatch === true && room.league === 'casual';

export const buildWatchUrl = (roomId: number | string, options: WatchUrlOptions = {}): string => {
	const params = new URLSearchParams();
	if (options.embed) params.set('embed', '1');
	if (options.board) params.set('board', options.board);
	if (options.mute) params.set('mute', '1');

	const query = params.toString();
	return `${gameClientUrl()}/${query ? `?${query}` : ''}#/watch/${roomId}`;
};

/** Share link for humans: the full client interface, no embed parameters. */
export const buildShareUrl = (roomId: number | string): string => buildWatchUrl(roomId);

export const buildEmbedSnippet = (
	roomId: number | string,
	options: { board?: BoardRenderer; width?: number; height?: number } = {},
): string => {
	const { board = '2d', width = 960, height = 600 } = options;
	const src = buildWatchUrl(roomId, { embed: true, board, mute: true });

	return [
		'<iframe',
		`  src="${src}"`,
		`  width="${width}"`,
		`  height="${height}"`,
		'  allow="fullscreen"',
		'  title="Live duel on Evolution"',
		'></iframe>',
	].join('\n');
};

export const roomTeams = (room: WatchRoom) => {
	const sorted = [...room.players].sort((a, b) => a.position - b.position);
	return {
		team0: sorted.filter((player) => player.team === 0),
		team1: sorted.filter((player) => player.team === 1),
	};
};

export const roomMatchup = (room: WatchRoom): string => {
	const { team0, team1 } = roomTeams(room);
	const left = team0.map((player) => player.name).join(' & ');
	const right = team1.map((player) => player.name).join(' & ');

	if (!left && !right) return 'Empty room';
	if (!left || !right) return left || right;
	return `${left} vs ${right}`;
};

export const isRoomLive = (room: WatchRoom): boolean =>
	room.started || room.status === 'dueling';

/** Live duels first, then the most watched, then newest room ids. */
export const sortWatchRooms = (rooms: WatchRoom[]): WatchRoom[] =>
	[...rooms].sort((a, b) => {
		const liveDiff = Number(isRoomLive(b)) - Number(isRoomLive(a));
		if (liveDiff !== 0) return liveDiff;

		const spectatorDiff = (b.spectators ?? 0) - (a.spectators ?? 0);
		if (spectatorDiff !== 0) return spectatorDiff;

		return b.id - a.id;
	});
