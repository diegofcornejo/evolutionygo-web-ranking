import { describe, it, expect } from 'vitest';
import type { WatchRoom } from '@types';
import {
  buildEmbedSnippet,
  buildShareUrl,
  buildWatchUrl,
  gameClientUrl,
  isRoomLive,
  isValidRoomId,
  isWatchableRoom,
  roomMatchup,
  resolveGameClientUrl,
  resolveRoomsApiUrl,
  roomsApiUrl,
  roomTeams,
  sortWatchRooms,
} from '@utils/watchLink';

const makeRoom = (overrides: Partial<WatchRoom> = {}): WatchRoom => ({
  id: 9775,
  status: 'dueling',
  started: true,
  private: false,
  canWatch: true,
  league: 'casual',
  banlist: '2026.05 TCG',
  rule: 'Anything Goes',
  bestOf: 3,
  startLp: 8000,
  timeLimit: 450,
  players: [
    { name: 'DATCEL', position: 0, team: 0 },
    { name: 'Javier', position: 1, team: 1 },
  ],
  maxPlayers: 2,
  spectators: 1,
  ...overrides,
});

describe('watchLink', () => {
  describe('endpoints', () => {
    it('falls back to the documented hosts when nothing is configured', () => {
      expect(resolveGameClientUrl()).toBe('https://evoduel.com');
      expect(resolveGameClientUrl('')).toBe('https://evoduel.com');
      expect(resolveRoomsApiUrl()).toBe('https://rooms.server.evolutionygo.com/api/rooms');
    });

    it('uses the configured hosts and drops trailing slashes', () => {
      expect(resolveGameClientUrl('https://client.test.local/')).toBe('https://client.test.local');
      expect(resolveGameClientUrl('https://client.test.local///')).toBe(
        'https://client.test.local',
      );
      expect(resolveRoomsApiUrl('https://rooms.test.local/api/rooms')).toBe(
        'https://rooms.test.local/api/rooms',
      );
    });

    it('resolves the runtime endpoints without a trailing slash', () => {
      expect(gameClientUrl()).not.toMatch(/\/$/);
      expect(roomsApiUrl()).toContain('/api/rooms');
    });
  });

  describe('isValidRoomId', () => {
    it('accepts positive integers only', () => {
      expect(isValidRoomId(9775)).toBe(true);
      expect(isValidRoomId('9775')).toBe(true);
      expect(isValidRoomId(0)).toBe(false);
      expect(isValidRoomId(-1)).toBe(false);
      expect(isValidRoomId(9.5)).toBe(false);
      expect(isValidRoomId('abc')).toBe(false);
      expect(isValidRoomId(null)).toBe(false);
      expect(isValidRoomId(undefined)).toBe(false);
    });
  });

  describe('isWatchableRoom', () => {
    it('accepts a public casual room that admits spectators', () => {
      expect(isWatchableRoom(makeRoom())).toBe(true);
    });

    it('rejects private rooms, refused spectators and verified rooms', () => {
      expect(isWatchableRoom(makeRoom({ private: true }))).toBe(false);
      expect(isWatchableRoom(makeRoom({ canWatch: false }))).toBe(false);
      expect(isWatchableRoom(makeRoom({ league: 'verified' }))).toBe(false);
    });
  });

  describe('buildWatchUrl', () => {
    it('builds the documented embed URL', () => {
      expect(buildWatchUrl(9775, { embed: true, board: '2d', mute: true })).toBe(
        'https://evoduel.com/?embed=1&board=2d&mute=1#/watch/9775',
      );
    });

    it('omits the query string when no parameters are requested', () => {
      expect(buildWatchUrl(9775)).toBe('https://evoduel.com/#/watch/9775');
      expect(buildShareUrl(9775)).toBe('https://evoduel.com/#/watch/9775');
    });

    it('supports the 3d renderer', () => {
      expect(buildWatchUrl(42, { embed: true, board: '3d' })).toBe(
        'https://evoduel.com/?embed=1&board=3d#/watch/42',
      );
    });
  });

  describe('buildEmbedSnippet', () => {
    it('produces a muted 2d iframe by default', () => {
      const snippet = buildEmbedSnippet(9775);

      expect(snippet).toContain(
        'src="https://evoduel.com/?embed=1&board=2d&mute=1#/watch/9775"',
      );
      expect(snippet).toContain('width="960"');
      expect(snippet).toContain('height="600"');
      expect(snippet).toContain('allow="fullscreen"');
    });

    it('honours renderer and size overrides', () => {
      const snippet = buildEmbedSnippet(9775, { board: '3d', width: 1280, height: 800 });

      expect(snippet).toContain('board=3d');
      expect(snippet).toContain('width="1280"');
      expect(snippet).toContain('height="800"');
    });
  });

  describe('roomTeams and roomMatchup', () => {
    it('splits players by team ordered by position', () => {
      const room = makeRoom({
        players: [
          { name: 'Javier', position: 1, team: 1 },
          { name: 'DATCEL', position: 0, team: 0 },
        ],
      });

      const { team0, team1 } = roomTeams(room);
      expect(team0.map((player) => player.name)).toEqual(['DATCEL']);
      expect(team1.map((player) => player.name)).toEqual(['Javier']);
    });

    it('formats the matchup', () => {
      expect(roomMatchup(makeRoom())).toBe('DATCEL vs Javier');
    });

    it('joins teammates in tag duels', () => {
      const room = makeRoom({
        players: [
          { name: 'A', position: 0, team: 0 },
          { name: 'B', position: 1, team: 0 },
          { name: 'C', position: 2, team: 1 },
          { name: 'D', position: 3, team: 1 },
        ],
      });

      expect(roomMatchup(room)).toBe('A & B vs C & D');
    });

    it('handles half-filled and empty rooms', () => {
      expect(roomMatchup(makeRoom({ players: [{ name: 'Solo', position: 0, team: 0 }] }))).toBe(
        'Solo',
      );
      expect(roomMatchup(makeRoom({ players: [] }))).toBe('Empty room');
    });
  });

  describe('isRoomLive', () => {
    it('treats started or dueling rooms as live', () => {
      expect(isRoomLive(makeRoom())).toBe(true);
      expect(isRoomLive(makeRoom({ started: false, status: 'dueling' }))).toBe(true);
      expect(isRoomLive(makeRoom({ started: false, status: 'waiting' }))).toBe(false);
    });
  });

  describe('sortWatchRooms', () => {
    it('puts live duels first, then the most watched, then the newest ids', () => {
      const waiting = makeRoom({ id: 1, started: false, status: 'waiting', spectators: 9 });
      const quietLive = makeRoom({ id: 2, spectators: 0 });
      const busyLive = makeRoom({ id: 3, spectators: 5 });
      const newerQuietLive = makeRoom({ id: 4, spectators: 0 });

      const sorted = sortWatchRooms([waiting, quietLive, busyLive, newerQuietLive]);

      expect(sorted.map((room) => room.id)).toEqual([3, 4, 2, 1]);
    });

    it('does not mutate the input', () => {
      const rooms = [makeRoom({ id: 1 }), makeRoom({ id: 2 })];
      sortWatchRooms(rooms);
      expect(rooms.map((room) => room.id)).toEqual([1, 2]);
    });
  });
});
