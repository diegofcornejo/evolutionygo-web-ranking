import { getSession, updateSession } from '@stores/sessionStore';
import { getAvatar, ownAvatarSrc } from '@stores/avatarStore';
import { theme } from '@stores/themeStore';
import type { Session } from '@types';
import { avatarDataUri } from '@utils/avatar';

const logout = () => {
	const session: Session = {
		isLoggedIn: false,
		token: '',
		user: { id: '', username: '' }
	};
	updateSession(session);
}

const handleLogout = () => {
	// @ts-ignore
	document.getElementById('button-navbar-logout').addEventListener('click', logout);
}

const toggleTheme = () => {
	theme.set(theme.get() === 'night' ? 'dracula' : 'night');
}

const openSettings = () => {
	const dialog = document.getElementById('dialog-settings');
	// @ts-ignore
	dialog.showModal();
}

const openAvatar = () => {
	const dialog = document.getElementById('dialog-avatar') as HTMLDialogElement | null;
	dialog?.showModal();
}

const handleOpenAvatar = () => {
	document.getElementById('button-navbar-avatar')?.addEventListener('click', openAvatar);
}

const handleOpenSettings = () => {
	// @ts-ignore
	document.getElementById('button-navbar-settings').addEventListener('click', openSettings);
}

const update = () => {
	const signinButton = document.getElementById('button-modal-signin');
	const signupButton = document.getElementById('button-modal-signup');
	const dropdownProfile = document.getElementById('dropdown-navbar-profile');
	if (getSession().isLoggedIn) {
		// @ts-ignore
		signinButton.style.display = 'none';
		// @ts-ignore
		signupButton.style.display = 'none';
		// @ts-ignore
		dropdownProfile.style.display = 'block';
	} else {
		// @ts-ignore
		signinButton.style.display = 'block';
		// @ts-ignore
		signupButton.style.display = 'block';
		// @ts-ignore
		dropdownProfile.style.display = 'none';
	}
}

const updateUser = () => {
	const session: Session = getSession();
	// @ts-ignore
	document.getElementById('navbar-username').innerHTML = session?.user?.username ?? '';
	// @ts-ignore
	document.getElementById('dropdown-navbar-avatar').src = ownAvatarSrc(session?.user?.id ?? '', session?.user?.username ?? '');
	// Determine default season, allowing tests to override via process.env
	const defaultSeason = (typeof process !== 'undefined' && process.env.PUBLIC_DEFAULT_SEASON) || import.meta.env.PUBLIC_DEFAULT_SEASON;
	// @ts-ignore
	document.getElementById('dropdown-navbar-profile-link').href = `/duelists/${session?.user?.id}/Global?username=${session?.user?.username}&season=${defaultSeason}`;
}

// Pages mark the logged-in player's pictures with data-avatar-user so their own avatar replaces
// the server-rendered initials; the original src comes back when they log out or reset it.
const updateOwnAvatars = (root: ParentNode = document) => {
	const userId = getSession()?.user?.id;
	root.querySelectorAll<HTMLImageElement>('img[data-avatar-user]').forEach((img) => {
		img.dataset.avatarFallback ??= img.getAttribute('src') ?? '';
		const saved = userId && img.dataset.avatarUser === userId ? getAvatar(userId) : null;
		const next = saved ? avatarDataUri(saved) : img.dataset.avatarFallback;
		if (img.getAttribute('src') !== next) img.setAttribute('src', next);
	});
}

const setTheme = () => {
	// @ts-ignore
	document.getElementById('button-navbar-theme').checked = theme.get() === 'dracula';
	// @ts-ignore
	document.getElementById('button-navbar-theme').addEventListener('change', toggleTheme);
}

// <details> submenus only close from their own <summary>, so close them when the visitor
// clicks elsewhere, picks one of their links, or presses Escape (target null).
const closeNavGroups = (target: EventTarget | null, root: ParentNode = document) => {
	const element = target instanceof Element ? target : null;
	root.querySelectorAll<HTMLDetailsElement>('details[data-nav-group][open]').forEach((group) => {
		const inside = !!element && group.contains(element);
		const choseLink = inside && !!element.closest('[data-nav-link]');
		if (!inside || choseLink) group.open = false;
	});
};

export { update, updateUser, updateOwnAvatars, setTheme, handleLogout, logout, handleOpenSettings, handleOpenAvatar, closeNavGroups };
