import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleOpenAvatar, updateOwnAvatars, updateUser } from '@components/NavBar/helper';
import { getSession } from '@stores/sessionStore';
import { avatars } from '@stores/avatarStore';
import { DEFAULT_AVATAR, avatarDataUri } from '@utils/avatar';

vi.mock('@stores/sessionStore', () => ({
	getSession: vi.fn(),
	updateSession: vi.fn(),
}));

const INITIALS = 'https://ui-avatars.com/api/?name=Ace&background=random&size=256';
const login = (id: string) =>
	(getSession as ReturnType<typeof vi.fn>).mockReturnValue({ isLoggedIn: !!id, token: '', user: { id, username: 'Ace' } });

describe('own avatar in the navbar and on the page', () => {
	beforeEach(() => {
		avatars.set({});
		document.body.innerHTML = `
			<span id="navbar-username"></span>
			<img id="dropdown-navbar-avatar" src="" />
			<a id="dropdown-navbar-profile-link"></a>
			<button id="button-navbar-avatar"></button>
			<dialog id="dialog-avatar"></dialog>
			<img id="mine" data-avatar-user="1" src="${INITIALS}" />
			<img id="theirs" data-avatar-user="2" src="${INITIALS}" />`;
	});

	const src = (id: string) => document.getElementById(id)?.getAttribute('src');

	it('shows the saved avatar in the navbar', () => {
		login('1');
		avatars.set({ '1': DEFAULT_AVATAR });
		updateUser();
		expect(src('dropdown-navbar-avatar')).toBe(avatarDataUri(DEFAULT_AVATAR));
	});

	it('swaps only the logged-in player pictures', () => {
		login('1');
		avatars.set({ '1': DEFAULT_AVATAR });
		updateOwnAvatars();
		expect(src('mine')).toBe(avatarDataUri(DEFAULT_AVATAR));
		expect(src('theirs')).toBe(INITIALS);
	});

	it('leaves pictures alone when the player has no avatar', () => {
		login('1');
		updateOwnAvatars();
		expect(src('mine')).toBe(INITIALS);
	});

	it('puts the initials back after logging out', () => {
		login('1');
		avatars.set({ '1': DEFAULT_AVATAR });
		updateOwnAvatars();
		login('');
		updateOwnAvatars();
		expect(src('mine')).toBe(INITIALS);
	});

	it('opens the avatar editor from the profile menu', () => {
		const dialog = document.getElementById('dialog-avatar') as HTMLDialogElement;
		dialog.showModal = vi.fn();
		handleOpenAvatar();
		document.getElementById('button-navbar-avatar')?.click();
		expect(dialog.showModal).toHaveBeenCalled();
	});
});
