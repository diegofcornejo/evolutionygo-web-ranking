import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { WatchRoom } from '@types';
import { watchRoomsStatus, watchRoomsStore, watchableRoomIds } from '@stores/watch/watchRoomsStore';
import { fetchWatchRooms, startWatchRoomsPolling } from '@stores/watch/watch-actions';

const makeRoom = (overrides: Partial<WatchRoom> = {}): WatchRoom => ({
  id: 1,
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
    { name: 'A', position: 0, team: 0 },
    { name: 'B', position: 1, team: 1 },
  ],
  maxPlayers: 2,
  spectators: 0,
  ...overrides,
});

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: async () => body,
});

describe('watch-actions', () => {
  beforeEach(() => {
    watchRoomsStore.set([]);
    watchRoomsStatus.set('idle');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('keeps only the rooms a guest is allowed to spectate', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue(
      jsonResponse({
        rooms: [
          makeRoom({ id: 1 }),
          makeRoom({ id: 2, private: true }),
          makeRoom({ id: 3, canWatch: false }),
          makeRoom({ id: 4, league: 'verified' }),
        ],
      }),
    );

    await fetchWatchRooms();

    expect(watchRoomsStore.get().map((room) => room.id)).toEqual([1]);
    expect(watchableRoomIds.get().has(1)).toBe(true);
    expect(watchableRoomIds.get().has(2)).toBe(false);
    expect(watchRoomsStatus.get()).toBe('ready');
  });

  it('sorts live duels before waiting rooms', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue(
      jsonResponse({
        rooms: [
          makeRoom({ id: 10, started: false, status: 'waiting' }),
          makeRoom({ id: 11, spectators: 3 }),
        ],
      }),
    );

    await fetchWatchRooms();

    expect(watchRoomsStore.get().map((room) => room.id)).toEqual([11, 10]);
  });

  it('replaces the listing so ended duels disappear', async () => {
    watchRoomsStore.set([makeRoom({ id: 99 })]);
    (global.fetch as any) = vi.fn().mockResolvedValue(jsonResponse({ rooms: [makeRoom({ id: 1 })] }));

    await fetchWatchRooms();

    expect(watchRoomsStore.get().map((room) => room.id)).toEqual([1]);
  });

  it('flags an unreachable listing without dropping the current rooms', async () => {
    watchRoomsStore.set([makeRoom({ id: 7 })]);
    (global.fetch as any) = vi.fn().mockRejectedValue(new Error('offline'));

    await fetchWatchRooms();

    expect(watchRoomsStatus.get()).toBe('error');
    expect(watchRoomsStore.get().map((room) => room.id)).toEqual([7]);
  });

  it('flags a failed response status', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue(jsonResponse({}, false, 503));

    await fetchWatchRooms();

    expect(watchRoomsStatus.get()).toBe('error');
  });

  it('tolerates a listing without a rooms array', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue(jsonResponse({}));

    await fetchWatchRooms();

    expect(watchRoomsStore.get()).toEqual([]);
    expect(watchRoomsStatus.get()).toBe('ready');
  });

  it('polls on an interval and stops when told to', async () => {
    vi.useFakeTimers();
    (global.fetch as any) = vi.fn().mockResolvedValue(jsonResponse({ rooms: [] }));

    const stop = startWatchRoomsPolling(5000);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(global.fetch).toHaveBeenCalledTimes(3);

    stop();
    await vi.advanceTimersByTimeAsync(10_000);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});
