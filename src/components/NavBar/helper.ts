import { isLoggedIn, userName, userId } from '../../stores/sessionStore';
import { tokenStore } from '../../stores/tokenStore';


const handleLogout = () => {
	isLoggedIn.set(false);
	tokenStore.set(undefined);
	userName.set('');
	userId.set('');
}

const logout = () => {
	// @ts-ignore
	document.getElementById('button-navbar-logout').addEventListener('click', handleLogout);
}

const update = () => {
	const signinButton = document.getElementById('button-modal-signin');
	const signupButton = document.getElementById('button-modal-signup');
	const dropdownProfile = document.getElementById('dropdown-navbar-profile');
	if (isLoggedIn.get()) {
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
	// @ts-ignore
	document.getElementById('navbar-username').innerHTML = userName.get() || '';
	// @ts-ignore
	document.getElementById('dropdown-navbar-avatar').src = `https://avatar.iran.liara.run/public/boy?username=${userName.get()}`;
	// @ts-ignore
	document.getElementById('dropdown-navbar-profile-link').href = `/duelists/${userId.get()}`;
}

export { update, logout, updateUser };
