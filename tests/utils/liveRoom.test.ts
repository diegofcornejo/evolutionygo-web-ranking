import { describe, it, expect } from 'vitest';
import type { Room } from '@types';
import {
  isRoomRanked,
  lpBaseline,
  lpPercent,
  lpTone,
  roomNoteTags,
  teamLp,
  teamPlayers,
  teamScore,
} from '@utils/liveRoom';

const room = (overrides: Partial<Room> = {}): Room => ({
  id: 1,
  turn: 1,
  bestOf: 1,
  notes: '',
  banList: { name: 'TCG' },
  players: [
    { position: 0, username: 'A', lps: 8000, score: 1, team: 0 },
    { position: 1, username: 'B', lps: 3000, score: 0, team: 1 },
    { position: 2, username: 'C', lps: 8000, score: 1, team: 0 },
  ],
  ...overrides,
});

describe('liveRoom utils', () => {
  it('detects ranked rooms from notes', () => {
    expect(isRoomRanked(room({ notes: '(Ranked) - SD Max: 15' }))).toBe(true);
    expect(isRoomRanked(room({ notes: '- SD Max: 15' }))).toBe(false);
  });

  it('splits notes into tags without the ranked marker', () => {
    expect(roomNoteTags(room({ notes: '(Ranked) - SD Max: 15' }))).toEqual(['SD Max: 15']);
    expect(roomNoteTags(room({ notes: '- SD Max: 15 - No-limit' }))).toEqual(['SD Max: 15', 'No-limit']);
    expect(roomNoteTags(room({ notes: '' }))).toEqual([]);
  });

  it('reads team players, LP and score', () => {
    const r = room();
    expect(teamPlayers(r, 0).map((p) => p.username)).toEqual(['A', 'C']);
    expect(teamLp(r, 1)).toBe(3000);
    expect(teamScore(r, 0)).toBe(1);
    expect(teamLp(room({ players: [] }), 0)).toBe(0);
  });

  it('uses 8000 or the highest LP on the table as the baseline', () => {
    expect(lpBaseline(room())).toBe(8000);
    expect(
      lpBaseline(room({ players: [{ position: 0, username: 'A', lps: 16000, score: 0, team: 0 }] })),
    ).toBe(16000);
  });

  it('clamps LP percent and maps it to a tone', () => {
    expect(lpPercent(4000, 8000)).toBe(50);
    expect(lpPercent(-100, 8000)).toBe(0);
    expect(lpPercent(9000, 8000)).toBe(100);
    expect(lpPercent(100, 0)).toBe(0);
    expect(lpTone(80)).toBe('bg-success');
    expect(lpTone(40)).toBe('bg-warning');
    expect(lpTone(10)).toBe('bg-error');
  });
});
