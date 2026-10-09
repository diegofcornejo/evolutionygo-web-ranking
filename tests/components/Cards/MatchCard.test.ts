import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { Room, WatchRoom } from '@types';
import MatchCard from '@components/Cards/MatchCard.svelte';
import { watchRoomsStore } from '@stores/watch/watchRoomsStore';

const mockRoom: Room = {
  id: 1,
  turn: 3,
  bestOf: 3,
  notes: '(Ranked) - SD Max: 15',
  banList: { name: 'TCG' },
  players: [
    { position: 0, userId: 'a1', username: 'Alice', lps: 8000, score: 1, team: 0 },
    { position: 1, userId: 'b2', username: 'Bob', lps: 1500, score: 2, team: 1 },
  ],
};

describe('MatchCard.svelte', () => {
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
    document.getElementById('match-card-dialog')?.remove();
  });

  it('renders players, life points, score and turn', () => {
    instance = mount(MatchCard, { target, props: { room: mockRoom } });
    const text = target.textContent ?? '';
    expect(text).toContain('Alice');
    expect(text).toContain('Bob');
    expect(text).toContain('8000');
    expect(text).toContain('1500');
    expect(text).toContain('1–2');
    expect(text).toContain('T3');
    expect(text).toContain('Bo3 · TCG');
  });

  it('flags ranked rooms', () => {
    instance = mount(MatchCard, { target, props: { room: mockRoom } });
    expect(target.textContent).toContain('Ranked');
  });

  it('links each player to their duelist profile', () => {
    instance = mount(MatchCard, { target, props: { room: mockRoom } });
    const link = target.querySelector('a[title="Alice"]') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/duelists/a1/TCG?username=Alice');
  });

  it('opens the shared live rooms dialog without rendering its own', () => {
    const dialog = document.createElement('dialog');
    dialog.id = 'match-card-dialog';
    let opened = false;
    dialog.showModal = () => { opened = true; };
    document.body.appendChild(dialog);

    instance = mount(MatchCard, { target, props: { room: mockRoom } });
    expect(target.querySelector('dialog')).toBeNull();

    (target.querySelector('button[aria-label="Show all live rooms"]') as HTMLButtonElement).click();
    expect(opened).toBe(true);
  });

  it('shows the watch link only for spectatable rooms', () => {
    instance = mount(MatchCard, { target, props: { room: mockRoom } });
    expect(target.querySelector('a[href="/watch?room=1"]')).toBeNull();

    watchRoomsStore.set([{ id: 1 } as WatchRoom]);
    flushSync();
    expect(target.querySelector('a[href="/watch?room=1"]')).not.toBeNull();
  });
});
