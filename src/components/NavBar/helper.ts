import { isLoggedIn } from '../../stores/sessionStore';
import { tokenStore } from '../../stores/tokenStore';


const handleLogout = () => {
	isLoggedIn.set(false);
	tokenStore.set(undefined);
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

export { update, logout };
