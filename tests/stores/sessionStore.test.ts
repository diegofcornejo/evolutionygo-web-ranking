import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession, updateSession, updateSessionProperty } from '@stores/sessionStore';

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

  it('updates a session property', () => {
    updateSession({ isLoggedIn: false, token: '', user: { id: '1', username: 'Ace' } });
    updateSessionProperty('token', 'token-123');
    expect(getSession().token).toBe('token-123');
  });
});
