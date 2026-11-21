import { describe, it, expect, beforeEach } from 'vitest';
import { avatars, clearAvatar, getAvatar, ownAvatarSrc, saveAvatar } from '@stores/avatarStore';
import { DEFAULT_AVATAR, avatarDataUri } from '@utils/avatar';

describe('avatarStore', () => {
	beforeEach(() => {
		avatars.set({});
	});

	it('has no avatar for a user who never made one', () => {
		expect(getAvatar('1')).toBeNull();
	});

	it('saves an avatar per user', () => {
		const look = { ...DEFAULT_AVATAR, hairStyle: 'spiky' as const };
		saveAvatar('1', look);
		expect(getAvatar('1')).toEqual(look);
		expect(getAvatar('2')).toBeNull();
	});

	it('ignores saves without a user', () => {
		saveAvatar('', DEFAULT_AVATAR);
		expect(avatars.get()).toEqual({});
	});

	it('repairs a stored avatar with options that no longer exist', () => {
		avatars.set({ '1': { ...DEFAULT_AVATAR, hairStyle: 'gone' } as never });
		expect(getAvatar('1')).toEqual(DEFAULT_AVATAR);
	});

	it('clears a user avatar without touching the others', () => {
		saveAvatar('1', DEFAULT_AVATAR);
		saveAvatar('2', DEFAULT_AVATAR);
		clearAvatar('1');
		expect(getAvatar('1')).toBeNull();
		expect(getAvatar('2')).toEqual(DEFAULT_AVATAR);
	});

	describe('ownAvatarSrc', () => {
		it('uses the saved avatar when there is one', () => {
			saveAvatar('1', DEFAULT_AVATAR);
			expect(ownAvatarSrc('1', 'Ace')).toBe(avatarDataUri(DEFAULT_AVATAR));
		});

		it('falls back to initials', () => {
			expect(ownAvatarSrc('1', 'Ace')).toBe('https://ui-avatars.com/api/?name=Ace&background=random&size=128');
		});
	});
});
