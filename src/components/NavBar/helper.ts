import { getSession, updateSession } from '@stores/sessionStore';
import { theme } from '@stores/themeStore';
import type { Session } from '@types';

const handleLogout = () => {
	const session: Session = {
		isLoggedIn: false,
		token: '',
		user: { id: '', username: '' }
	};
	updateSession(session);
}

const logout = () => {
	// @ts-ignore
	document.getElementById('button-navbar-logout').addEventListener('click', handleLogout);
}

const toggleTheme = () => {
	theme.set(theme.get() === 'night' ? 'dark' : 'night');
}

const handleSettings = () => {
	const dialog = document.getElementById('dialog-settings');
	// @ts-ignore
	dialog.showModal();
}

const openSettings = () => {
	// @ts-ignore
	document.getElementById('button-navbar-settings').addEventListener('click', handleSettings);
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
	// @ts-ignore
	document.getElementById('dropdown-navbar-profile-link').href = `/duelists/${session?.user?.id}`;
}

const setTheme = () => {
	// @ts-ignore
	document.getElementById('button-navbar-theme').checked = theme.get() === 'dark';
	// @ts-ignore
	document.getElementById('button-navbar-theme').addEventListener('change', toggleTheme);
}

export { update, logout, updateUser, setTheme, openSettings, handleLogout };
