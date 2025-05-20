import { describe, it, expect, beforeEach, vi } from 'vitest';
import MatchCard from '../src/components/Cards/MatchCard.svelte';
import type { Room } from '../src/types/Room';

// Mock the roomsStore
vi.mock('../src/stores/rooms/roomsStore', () => {
  return {
    roomsStore: {
      subscribe: (run: any) => {
        run([mockRoom]);
        return () => {};
      },
      set: () => {},
      get: () => [mockRoom],
    },
  };
});

// Create a mock room object
const mockRoom: Room = {
  id: 1,
  turn: 3,
  bestOf: 3,
  notes: 'Test match',
  banList: { name: 'TCG' },
  players: [
    {
      position: 0,
      username: 'Alice',
      lps: 8000,
      score: 1,
      team: 0,
    },
    {
      position: 1,
      username: 'Bob',
      lps: 7500,
      score: 2,
      team: 1,
    },
  ],
};

describe('MatchCard.svelte', () => {
  let target: HTMLElement;

  beforeEach(() => {
    target = document.createElement('div');
    document.body.appendChild(target);
  });

  it('renders player usernames and scores', () => {
    const instance = new MatchCard({
      target,
      props: { room: mockRoom },
    });
    expect(target.innerHTML).toContain('Alice');
    expect(target.innerHTML).toContain('Bob');
    expect(target.innerHTML).toContain('8000');
    expect(target.innerHTML).toContain('7500');
    expect(target.innerHTML).toContain('vs');
    expect(target.innerHTML).toContain('Test match');
    instance.$destroy();
  });

  it('opens and closes the dialog when button is clicked', async () => {
    const instance = new MatchCard({
      target,
      props: { room: mockRoom },
    });
    const button = target.querySelector('button');
    expect(button).toBeTruthy();
    // Mock dialog methods before clicking
    const dialog = document.getElementById('match-card-dialog') as HTMLDialogElement;
    expect(dialog).toBeTruthy();
    // JSDOM does not implement showModal/close, so we mock them
    let open = false;
    dialog.showModal = () => { open = true; Object.defineProperty(dialog, 'open', { value: true, configurable: true }); };
    dialog.close = () => { open = false; Object.defineProperty(dialog, 'open', { value: false, configurable: true }); };
    button?.click();
    expect(dialog.open).toBe(true);
    // Simulate close
    const closeBtn = dialog.querySelector('button.btn-primary') as HTMLButtonElement;
    closeBtn?.click();
    expect(dialog.open).toBe(false);
    instance.$destroy();
  });
}); 