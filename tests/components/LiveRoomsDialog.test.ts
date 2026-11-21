import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { Room, WatchRoom } from '@types';
import LiveRoomsDialog from '@components/LiveRoomsDialog.svelte';
import { roomsStore } from '@stores/rooms/roomsStore';
import { watchRoomsStore } from '@stores/watch/watchRoomsStore';

const room = (id: number, overrides: Partial<Room> = {}): Room => ({
  id,
  turn: 4,
  bestOf: 1,
  notes: '',
  banList: { name: 'Genesys' },
  players: [
    { position: 0, userId: `u${id}a`, username: `P${id}A`, lps: 8000, score: 0, team: 0 },
    { position: 1, userId: `u${id}b`, username: `P${id}B`, lps: 2000, score: 1, team: 1 },
  ],
  ...overrides,
});

describe('LiveRoomsDialog.svelte', () => {
  let target: HTMLElement;
  let instance: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
    watchRoomsStore.set([]);
  });

  afterEach(() => {
    if (instance) unmount(instance);
    instance = undefined;
    target.remove();
    roomsStore.set([]);
  });

  it('shows room and unique player counts', () => {
    roomsStore.set([
      room(1),
      room(2, {
        players: [
          { position: 0, username: 'P1A', lps: 8000, score: 0, team: 0 },
          { position: 1, username: 'Other', lps: 8000, score: 0, team: 1 },
        ],
      }),
    ]);
    instance = mount(LiveRoomsDialog, { target });
    const text = target.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(text).toContain('2 rooms · 3 players online');
  });

  it('renders the empty state when no duels are running', () => {
    roomsStore.set([]);
    instance = mount(LiveRoomsDialog, { target });
    expect(target.textContent).toContain('No duels running right now');
  });

  it('renders a scoreboard row with format, notes, score and turn', () => {
    roomsStore.set([room(7, { bestOf: 3, notes: '(Ranked) - SD Max: 15', banList: { name: '2026.09 TCG' } })]);
    instance = mount(LiveRoomsDialog, { target });
    const row = target.querySelector('li') as HTMLElement;
    const text = row.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(text).toContain('Bo3 · 2026.09 TCG');
    expect(text).toContain('Ranked');
    expect(text).toContain('SD Max: 15');
    expect(text).toContain('0–1');
    expect(text).toContain('Turn 4');
    expect(row.querySelectorAll('[role="meter"]')).toHaveLength(2);
  });

  it('offers watch only for spectatable rooms', () => {
    roomsStore.set([room(1), room(2)]);
    watchRoomsStore.set([{ id: 2 } as WatchRoom]);
    instance = mount(LiveRoomsDialog, { target });
    flushSync();
    expect(target.querySelector('a[href="/watch?room=1"]')).toBeNull();
    expect(target.querySelector('a[href="/watch?room=2"]')).not.toBeNull();
    expect(target.querySelectorAll('[aria-label="Not watchable"]')).toHaveLength(1);
  });

  it('closes from the header button', () => {
    roomsStore.set([room(1)]);
    instance = mount(LiveRoomsDialog, { target });
    flushSync();
    const dialog = target.querySelector('dialog') as HTMLDialogElement;
    let closed = false;
    dialog.close = () => { closed = true; };
    (target.querySelector('header button[aria-label="Close"]') as HTMLButtonElement).click();
    expect(closed).toBe(true);
  });
});
