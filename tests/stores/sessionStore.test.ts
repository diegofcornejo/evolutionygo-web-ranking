import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession, updateSession } from '@stores/sessionStore';

vi.mock('@nanostores/persistent', () => {
  const store = {
    value: '',
    get: vi.fn(() => store.value),
    set: vi.fn((next: string) => {
      store.value = next;
    }),
  };
  return {
    persistentAtom: vi.fn(() => store),
  };
});

describe('sessionStore', () => {
  beforeEach(() => {
    updateSession({ isLoggedIn: false, token: '', user: { id: '', username: '' } });
  });

  it('returns parsed session data', () => {
    updateSession({ isLoggedIn: true, token: 'abc', user: { id: '1', username: 'Ace' } });
    expect(getSession()).toEqual({ isLoggedIn: true, token: 'abc', user: { id: '1', username: 'Ace' } });
  });

  it('mustUpgrade:true round-trips through updateSession/getSession (REQ-CROSS-4)', () => {
    updateSession({ isLoggedIn: true, token: 'tok', user: { id: '2', username: 'Duel' }, mustUpgrade: true });
    expect(getSession().mustUpgrade).toBe(true);
  });

  it('mustUpgrade:false round-trips through updateSession/getSession (REQ-CROSS-4)', () => {
    updateSession({ isLoggedIn: true, token: 'tok', user: { id: '2', username: 'Duel' }, mustUpgrade: false });
    expect(getSession().mustUpgrade).toBe(false);
  });

  it('mustUpgrade absent when not set (backward-compatible)', () => {
    updateSession({ isLoggedIn: true, token: 'tok', user: { id: '3', username: 'Mono' } });
    expect(getSession().mustUpgrade).toBeUndefined();
  });
});
