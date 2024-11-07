import { isLoggedIn, userName, userId } from '../../stores/sessionStore';
import { tokenStore } from '../../stores/tokenStore';


const handleLogout = () => {
	isLoggedIn.set(false);
	tokenStore.set(undefined);
	userName.set('');
}

const logout = () => {
	// @ts-ignore
	document.getElementById('button-navbar-logout').addEventListener('click', handleLogout);
}

const update = (value: boolean) => {
	const signinButton = document.getElementById('button-modal-signin');
	const signupButton = document.getElementById('button-modal-signup');
	const dropdownProfile = document.getElementById('dropdown-navbar-profile');
	if (value) {
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

const updateUsername = (value: string) => {
	// @ts-ignore
	document.getElementById('navbar-username').innerHTML = value || '';
	// @ts-ignore
	document.getElementById('dropdown-navbar-avatar').src = `https://avatar.iran.liara.run/public/boy?username=${value}`;
	// @ts-ignore
	document.getElementById('dropdown-navbar-profile-link').href = `/duelists/${userId.get()}/${value}`;
}

export { update, logout, updateUsername };
