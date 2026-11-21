import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSession } from '@stores/sessionStore';
import { avatars, avatarsSynced, clearAvatar, getAvatar, ownAvatarSrc, saveAvatar, syncOwnAvatar } from '@stores/avatarStore';
import { DEFAULT_AVATAR, avatarDataUri, deleteMyAvatar, fetchMyAvatar, putMyAvatar } from '@utils/avatar';

vi.mock('@stores/sessionStore', () => ({ getSession: vi.fn() }));
vi.mock('@utils/avatar', async (importOriginal) => ({
	...(await importOriginal<typeof import('@utils/avatar')>()),
	fetchMyAvatar: vi.fn(),
	putMyAvatar: vi.fn(),
	deleteMyAvatar: vi.fn(),
}));

const spiky = { ...DEFAULT_AVATAR, hairStyle: 'spiky' as const };
const login = (id = '1') =>
	vi.mocked(getSession).mockReturnValue({ isLoggedIn: !!id, token: id ? 't' : '', user: { id, username: 'Ace' } });

describe('avatarStore', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		avatars.set({});
		avatarsSynced.set([]);
		login();
	});

	it('has no avatar for a user who never made one', () => {
		expect(getAvatar('1')).toBeNull();
	});

	it('repairs a cached avatar with options that no longer exist', () => {
		avatars.set({ '1': { ...DEFAULT_AVATAR, hairStyle: 'gone' } as never });
		expect(getAvatar('1')).toEqual(DEFAULT_AVATAR);
	});

	describe('syncOwnAvatar', () => {
		it('does nothing when logged out', async () => {
			login('');
			await syncOwnAvatar();
			expect(fetchMyAvatar).not.toHaveBeenCalled();
		});

		it('loads the avatar saved in the API', async () => {
			vi.mocked(fetchMyAvatar).mockResolvedValue(spiky);
			await syncOwnAvatar();
			expect(fetchMyAvatar).toHaveBeenCalledWith('t');
			expect(getAvatar('1')).toEqual(spiky);
		});

		it('uploads a browser-saved avatar when the API has none', async () => {
			avatars.set({ '1': spiky });
			vi.mocked(fetchMyAvatar).mockResolvedValue(null);
			vi.mocked(putMyAvatar).mockResolvedValue('ok');
			await syncOwnAvatar();
			expect(putMyAvatar).toHaveBeenCalledWith('t', spiky);
			expect(getAvatar('1')).toEqual(spiky);
		});

		it('keeps the browser copy when that upload fails', async () => {
			avatars.set({ '1': spiky });
			vi.mocked(fetchMyAvatar).mockResolvedValue(null);
			vi.mocked(putMyAvatar).mockResolvedValue('error');
			await syncOwnAvatar();
			expect(getAvatar('1')).toEqual(spiky);
		});

		it('uploads the browser copy only once, so a deletion on another device sticks', async () => {
			avatars.set({ '1': spiky });
			vi.mocked(fetchMyAvatar).mockResolvedValue(null);
			vi.mocked(putMyAvatar).mockResolvedValue('ok');
			await syncOwnAvatar();
			vi.mocked(putMyAvatar).mockClear();

			await syncOwnAvatar();

			expect(putMyAvatar).not.toHaveBeenCalled();
			expect(getAvatar('1')).toBeNull();
		});

		it('drops a cached avatar the API no longer has once this browser has synced', async () => {
			avatarsSynced.set(['1']);
			avatars.set({ '1': spiky });
			vi.mocked(fetchMyAvatar).mockResolvedValue(null);
			await syncOwnAvatar();
			expect(putMyAvatar).not.toHaveBeenCalled();
			expect(getAvatar('1')).toBeNull();
		});

		it('leaves nothing cached when the API has none and the browser has none', async () => {
			vi.mocked(fetchMyAvatar).mockResolvedValue(null);
			await syncOwnAvatar();
			expect(putMyAvatar).not.toHaveBeenCalled();
			expect(getAvatar('1')).toBeNull();
		});

		it('falls back to initials when the API fails', async () => {
			vi.mocked(fetchMyAvatar).mockResolvedValue(undefined);
			await syncOwnAvatar();
			expect(getAvatar('1')).toBeNull();
			expect(ownAvatarSrc('1', 'Ace')).toBe('https://ui-avatars.com/api/?name=Ace&background=random&size=128');
		});

		it('keeps the cached avatar when the API fails', async () => {
			avatars.set({ '1': spiky });
			vi.mocked(fetchMyAvatar).mockResolvedValue(undefined);
			await syncOwnAvatar();
			expect(putMyAvatar).not.toHaveBeenCalled();
			expect(getAvatar('1')).toEqual(spiky);
		});
	});

	describe('saveAvatar', () => {
		it('caches the avatar only after the API accepts it', async () => {
			vi.mocked(putMyAvatar).mockResolvedValue('ok');
			expect(await saveAvatar('1', spiky)).toBe('ok');
			expect(putMyAvatar).toHaveBeenCalledWith('t', spiky);
			expect(getAvatar('1')).toEqual(spiky);
			expect(avatarsSynced.get()).toEqual(['1']);
		});

		it('leaves the cache alone when the API refuses it', async () => {
			avatars.set({ '1': DEFAULT_AVATAR });
			vi.mocked(putMyAvatar).mockResolvedValue('error');
			expect(await saveAvatar('1', spiky)).toBe('error');
			expect(getAvatar('1')).toEqual(DEFAULT_AVATAR);
		});
	});

	describe('clearAvatar', () => {
		it('removes the cache only after the API accepts it', async () => {
			avatars.set({ '1': spiky, '2': DEFAULT_AVATAR });
			vi.mocked(deleteMyAvatar).mockResolvedValue('ok');
			expect(await clearAvatar('1')).toBe('ok');
			expect(getAvatar('1')).toBeNull();
			expect(avatarsSynced.get()).toEqual(['1']);
			expect(getAvatar('2')).toEqual(DEFAULT_AVATAR);
		});

		it('keeps the avatar when the API refuses', async () => {
			avatars.set({ '1': spiky });
			vi.mocked(deleteMyAvatar).mockResolvedValue('error');
			expect(await clearAvatar('1')).toBe('error');
			expect(getAvatar('1')).toEqual(spiky);
		});
	});

	describe('ownAvatarSrc', () => {
		it('uses the cached avatar when there is one', () => {
			avatars.set({ '1': DEFAULT_AVATAR });
			expect(ownAvatarSrc('1', 'Ace')).toBe(avatarDataUri(DEFAULT_AVATAR));
		});
	});
});
