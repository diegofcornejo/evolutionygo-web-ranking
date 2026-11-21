import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import type { WatchRoom } from '@types';
import WatchSection from '@sections/Watch.svelte';
import { watchRoomsStatus, watchRoomsStore } from '@stores/watch/watchRoomsStore';
import { roomsStore } from '@stores/rooms/roomsStore';

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

const mockListing = (rooms: WatchRoom[]) => {
  (global.fetch as any) = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ rooms }),
  });
};

const roomButtons = (target: HTMLElement) =>
  Array.from(target.querySelectorAll<HTMLButtonElement>('[data-umami-event="watch-select-room"]'));

const frames = (target: HTMLElement) => Array.from(target.querySelectorAll('iframe'));

const searchInput = (target: HTMLElement) =>
  target.querySelector<HTMLInputElement>('input[aria-label="Search duels"]');

// jsdom has no layout, so rows report a height of 0 unless it is stubbed.
const stubRowHeight = (height: number) => {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => height,
  });
};

const typeSearch = (target: HTMLElement, value: string) => {
  const input = searchInput(target);
  if (!input) throw new Error('search input is not rendered');
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  flushSync();
};

const activeFrame = (target: HTMLElement) =>
  frames(target).find((frame) => !frame.className.includes('watch-frame-idle'));

describe('WatchSection', () => {
  let target: HTMLElement;

  beforeEach(() => {
    watchRoomsStore.set([]);
    watchRoomsStatus.set('idle');
    roomsStore.set([]);
    window.history.replaceState({}, '', '/watch');
    vi.spyOn(console, 'error').mockImplementation(() => {});

    target = document.createElement('div');
    document.body.appendChild(target);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight');
    document.body.innerHTML = '';
  });

  it('shows the loading spinner while the listing is in flight', () => {
    (global.fetch as any) = vi.fn().mockReturnValue(new Promise(() => {}));

    const instance = mount(WatchSection as any, { target });

    expect(target.innerHTML).toContain('loading-spinner');

    unmount(instance);
  });

  it('lists the watchable rooms and auto-watches the first one', async () => {
    mockListing([makeRoom({ id: 9775 }), makeRoom({ id: 2810, players: [
      { name: 'Odon', position: 0, team: 0 },
      { name: 'NekoJeff', position: 1, team: 1 },
    ] })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(2));

    expect(target.innerHTML).toContain('DATCEL vs Javier');
    expect(target.innerHTML).toContain('Odon vs NekoJeff');
    expect(target.innerHTML).toContain('2026.05 TCG');

    const frame = activeFrame(target);
    expect(frame?.getAttribute('src')).toBe(
      'https://evoduel.com/?embed=1&board=2d&mute=1#/watch/9775',
    );
    expect(frame?.getAttribute('allow')).toBe('fullscreen');
    expect(window.location.search).toBe('?room=9775');

    unmount(instance);
  });

  it('honours a deep-linked room that is not in the listing', async () => {
    mockListing([makeRoom({ id: 9775 })]);

    const instance = mount(WatchSection as any, { target, props: { initialRoomId: 4242 } });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    expect(activeFrame(target)?.getAttribute('src')).toContain('#/watch/4242');
    expect(target.innerHTML).toContain('no longer published in the listing');

    unmount(instance);
  });

  it('keeps switched-away frames mounted and caps them at four', async () => {
    // Equally busy live duels are listed newest first, so the buttons are 5..1.
    mockListing([1, 2, 3, 4, 5].map((id) => makeRoom({ id })));

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(5));

    expect(frames(target)).toHaveLength(1);
    expect(activeFrame(target)?.getAttribute('src')).toContain('#/watch/5');

    for (const button of roomButtons(target).slice(1, 4)) {
      button.click();
      flushSync();
    }

    expect(frames(target)).toHaveLength(4);
    expect(
      frames(target).filter((frame) => frame.className.includes('watch-frame-idle')),
    ).toHaveLength(3);
    expect(activeFrame(target)?.getAttribute('src')).toContain('#/watch/2');

    roomButtons(target)[4].click();
    flushSync();

    const sources = frames(target).map((frame) => frame.getAttribute('src') ?? '');
    expect(sources).toHaveLength(4);
    expect(sources.some((src) => src.includes('#/watch/5'))).toBe(false);
    expect(activeFrame(target)?.getAttribute('src')).toContain('#/watch/1');

    unmount(instance);
  });

  it('reuses an already mounted frame when switching back', async () => {
    mockListing([makeRoom({ id: 1 }), makeRoom({ id: 2 })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(2));

    roomButtons(target)[1].click();
    flushSync();
    expect(activeFrame(target)?.getAttribute('src')).toContain('#/watch/1');

    roomButtons(target)[0].click();
    flushSync();

    expect(frames(target)).toHaveLength(2);
    expect(activeFrame(target)?.getAttribute('src')).toContain('#/watch/2');

    unmount(instance);
  });

  it('loads a new frame for the 3d renderer', async () => {
    mockListing([makeRoom({ id: 9775 })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    target.querySelector<HTMLButtonElement>('[data-umami-event="watch-board-3d"]')?.click();
    flushSync();

    expect(frames(target)).toHaveLength(2);
    expect(activeFrame(target)?.getAttribute('src')).toBe(
      'https://evoduel.com/?embed=1&board=3d&mute=1#/watch/9775',
    );

    unmount(instance);
  });

  it('shows the embed snippet on demand', async () => {
    mockListing([makeRoom({ id: 9775 })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    target.querySelector<HTMLButtonElement>('[data-umami-event="watch-toggle-embed"]')?.click();
    flushSync();

    const snippet = target.querySelector<HTMLTextAreaElement>('textarea[aria-label="Embed code"]');
    expect(snippet?.value).toContain('<iframe');
    expect(snippet?.value).toContain('?embed=1&board=2d&mute=1#/watch/9775');

    unmount(instance);
  });

  it('merges the live score coming from the rooms WebSocket feed', async () => {
    mockListing([makeRoom({ id: 9775 })]);
    roomsStore.set([
      {
        id: 9775,
        turn: 4,
        bestOf: 3,
        notes: '',
        banList: { name: '2026.05 TCG' },
        players: [
          { position: 0, username: 'DATCEL', lps: 3600, score: 1, team: 0 },
          { position: 1, username: 'Javier', lps: 6800, score: 0, team: 1 },
        ],
      },
    ] as any);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    const row = roomButtons(target)[0];
    const rowText = row.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(rowText).toContain('DATCEL 3600');
    expect(rowText).toContain('Javier 6800');
    expect(rowText).toContain('1–0');
    expect(rowText).toContain('T4');
    expect(row.querySelectorAll('[role="meter"]')).toHaveLength(2);
    expect(row.querySelector('a')).toBeNull();

    const header = target.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(header).toContain('Turn 4');

    unmount(instance);
  });

  it('filters the listing by duelist, room id and banlist without changing what is playing', async () => {
    mockListing([
      makeRoom({ id: 100, banlist: '2026.05 TCG' }),
      makeRoom({
        id: 200,
        banlist: '2026.03 MD',
        players: [
          { name: 'Odon', position: 0, team: 0 },
          { name: 'NekoJeff', position: 1, team: 1 },
        ],
      }),
    ]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(2));

    expect(target.innerHTML).toContain('2 of 2 duels');
    const playing = activeFrame(target)?.getAttribute('src');

    typeSearch(target, 'nekojeff');
    expect(roomButtons(target)).toHaveLength(1);
    expect(target.innerHTML).toContain('Odon vs NekoJeff');
    expect(target.innerHTML).toContain('1 of 2 duels');
    // Searching only narrows the list; the duel on screen keeps playing.
    expect(activeFrame(target)?.getAttribute('src')).toBe(playing);

    typeSearch(target, '100');
    expect(roomButtons(target)).toHaveLength(1);
    expect(target.innerHTML).toContain('DATCEL vs Javier');

    typeSearch(target, '2026.03 md');
    expect(roomButtons(target)).toHaveLength(1);
    expect(target.innerHTML).toContain('Odon vs NekoJeff');

    unmount(instance);
  });

  it('offers a way out when the search matches nothing', async () => {
    mockListing([makeRoom({ id: 100 })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    typeSearch(target, 'nobody');
    expect(roomButtons(target)).toHaveLength(0);
    expect(target.innerHTML).toContain('No duel matches');

    target.querySelector<HTMLButtonElement>('button.btn-ghost')?.click();
    flushSync();

    expect(roomButtons(target)).toHaveLength(1);
    expect(searchInput(target)?.value).toBe('');

    unmount(instance);
  });

  it('lays the room list out as a single non-wrapping column', async () => {
    mockListing(Array.from({ length: 12 }, (_, index) => makeRoom({ id: index + 1 })));

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(12));

    const list = target.querySelector('ul');
    // daisyUI's `.menu` is `flex-flow: column wrap`, which turns a height cap
    // into extra columns and a horizontal scrollbar.
    expect(list?.className).not.toContain('menu');
    expect(list?.className).toContain('flex-col');
    expect(list?.className).toContain('flex-nowrap');
    expect(list?.className).toContain('overflow-x-hidden');

    unmount(instance);
  });

  it('caps the room list at five rows and scrolls the rest', async () => {
    stubRowHeight(60);
    mockListing(Array.from({ length: 12 }, (_, index) => makeRoom({ id: index + 1 })));

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(12));

    const list = target.querySelector('ul');
    expect(list?.className).toContain('overflow-y-auto');
    expect(list?.style.maxHeight).toBe('300px');

    unmount(instance);
  });

  it('lets the room list grow freely while it holds five rows or fewer', async () => {
    stubRowHeight(60);
    mockListing(Array.from({ length: 5 }, (_, index) => makeRoom({ id: index + 1 })));

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(5));

    expect(target.querySelector('ul')?.style.maxHeight).toBe('');

    unmount(instance);
  });

  it('re-measures the cap when a search narrows the list', async () => {
    stubRowHeight(60);
    mockListing([
      ...Array.from({ length: 8 }, (_, index) => makeRoom({ id: index + 1 })),
      makeRoom({
        id: 500,
        players: [
          { name: 'Odon', position: 0, team: 0 },
          { name: 'NekoJeff', position: 1, team: 1 },
        ],
      }),
    ]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(9));
    expect(target.querySelector('ul')?.style.maxHeight).toBe('300px');

    typeSearch(target, 'odon');
    expect(target.querySelector('ul')?.style.maxHeight).toBe('');

    unmount(instance);
  });

  it('keeps the last known duels when a poll fails', async () => {
    mockListing([makeRoom({ id: 100 })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    (global.fetch as any).mockRejectedValue(new Error('offline'));
    await (await import('@stores/watch/watch-actions')).fetchWatchRooms();
    flushSync();

    expect(roomButtons(target)).toHaveLength(1);
    expect(target.innerHTML).toContain('showing the last duels we saw');
    expect(target.innerHTML).not.toContain('Something went wrong');

    unmount(instance);
  });

  it('shows an empty state when no duel admits spectators', async () => {
    mockListing([makeRoom({ id: 1, private: true })]);

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(target.innerHTML).toContain('No public duels right now'));

    expect(frames(target)).toHaveLength(0);
    expect(target.innerHTML).toContain('Nothing selected');

    unmount(instance);
  });

  it('offers a retry when the listing is unreachable', async () => {
    (global.fetch as any) = vi.fn().mockRejectedValue(new Error('offline'));

    const instance = mount(WatchSection as any, { target });
    await vi.waitFor(() => expect(target.innerHTML).toContain('Something went wrong'));

    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ rooms: [makeRoom({ id: 55 })] }),
    });

    target.querySelector<HTMLButtonElement>('button.btn-primary')?.click();
    await vi.waitFor(() => expect(roomButtons(target)).toHaveLength(1));

    unmount(instance);
  });
});
