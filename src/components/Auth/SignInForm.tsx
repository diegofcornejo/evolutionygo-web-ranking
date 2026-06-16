import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import type { Session } from '@types';
import { updateSession } from '@stores/sessionStore';
import { AuthEmailField, AuthErrorMessage } from './FormFields';

export function SignInForm({ dialog }: Readonly<{ dialog: string }>) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [forgotPassword, setForgotPassword] = useState(false);
	const [resetSent, setResetSent] = useState(false);
	const isLoginMode = !forgotPassword;

	const cleanForm = () => {
		setEmail('');
		setPassword('');
		setError(null);
		setResetSent(false);
	}

	const closeModal = () => {
		const modal = document.getElementById(dialog) as HTMLDialogElement;
		if (modal) {
			modal.close();
			cleanForm();
		}
	}

	const switchForm = () => {
		setForgotPassword((value) => !value);
		cleanForm();
	}

	const handleSubmit = async (event: { preventDefault: () => void; }) => {
		event.preventDefault();

		try {
			const endpoint = isLoginMode
				? `users/login`
				: `users/forgot-password`;

			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(isLoginMode ? { email, password } : { email })
			});

			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				if (isLoginMode) {
					const sessionData: Session = {
						isLoggedIn: true,
						token: data.token,
						user: { id: data.id, username: data.username },
						mustUpgrade: data.mustUpgrade,
					};
					updateSession(sessionData);

					const loginSource = sessionStorage.getItem('wrapped-login-source');
					if (loginSource === 'home-cta') {
						(window as Window & { umami?: { track: (eventName: string) => void } }).umami?.track('wrapped-cta-login-success');
						sessionStorage.removeItem('wrapped-login-source');
					}

					if (data.mustUpgrade) {
						window.location.href = '/upgrade-password';
						return;
					}

					closeModal();
					return;
				}

				setResetSent(true);
				return;
			}

			setError(data.message || 'Invalid credentials');
		} catch (error) {
			console.error('Error in sign in:', error);
			setError('No connection to server');
		}
	};

	if (resetSent) {
		return (
			<div className='space-y-4 text-center'>
				<div className='flex justify-center'>
					<div className='w-12 h-12 rounded-full bg-success/20 flex items-center justify-center text-success text-2xl'>
						✓
					</div>
				</div>
				<h3 className='text-lg font-semibold'>Check your inbox</h3>
				<p className='text-sm'>
					We sent a password reset link to <strong>{email}</strong>. It expires in 1 hour. Don't forget to check your spam folder.
				</p>
				<div className='flex justify-end'>
					<button className='btn btn-primary' type='button' onClick={closeModal}>
						Done
					</button>
				</div>
			</div>
		);
	}

	return (
		<form className='space-y-4' onSubmit={handleSubmit}>
			<AuthEmailField value={email} onChange={setEmail} />

			{isLoginMode && (
				<label className="input input-bordered flex items-center gap-2 w-full">
					<ReactSVG src='/icons/password.svg' className='w-4 h-4 opacity-70' />
				<input
					type="password"
					className="grow"
					name="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					aria-label="Password"
				/>
				</label>
			)}

			<AuthErrorMessage message={error} />

			<p className='text-xs'>
				<button type="button" className='cursor-pointer link link-hover' onClick={switchForm} id='forgot-password-link'>{isLoginMode ? 'Forgot password?' : 'Back to Login'}</button>
			</p>

			<div className='flex justify-end gap-2'>
				{isLoginMode && (
					<button className="btn btn-primary" type="submit" data-umami-event='signin-submit'>
						Login
					</button>
				)}
				{!isLoginMode && (
					<button className="btn btn-primary" type="submit" data-umami-event='forgot-password-submit'>
						Reset Password
					</button>
				)}
				<button className="btn btn-outline" type="button" onClick={closeModal} data-umami-event='signin-close'>Close</button>
			</div>
		</form>
	);
}
