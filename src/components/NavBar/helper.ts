import { getSession, updateSession } from '@stores/sessionStore';
import { theme } from '@stores/themeStore';
import type { Session } from '@types';

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
	document.getElementById('dropdown-navbar-avatar').src = `https://ui-avatars.com/api/?name=${session?.user?.username}&background=random&size=128`;
	// Determine default season, allowing tests to override via process.env
	const defaultSeason = (typeof process !== 'undefined' && process.env.PUBLIC_DEFAULT_SEASON) || import.meta.env.PUBLIC_DEFAULT_SEASON;
	// @ts-ignore
	document.getElementById('dropdown-navbar-profile-link').href = `/duelists/${session?.user?.id}/Global?username=${session?.user?.username}&season=${defaultSeason}`;
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

export { update, updateUser, setTheme, handleLogout, logout, handleOpenSettings, closeNavGroups };
