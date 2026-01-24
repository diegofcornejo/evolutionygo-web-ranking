import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import { toast } from 'sonner';
import type { Session } from '@types';
import { updateSession } from '@stores/sessionStore';
import { AuthEmailField, AuthErrorMessage } from './FormFields';

export function SignInForm({ dialog }: Readonly<{ dialog: string }>) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [forgotPassword, setForgotPassword] = useState(false);
	const isLoginMode = !forgotPassword;

	const cleanForm = () => {
		setEmail('');
		setPassword('');
		setError(null);
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
					};
					updateSession(sessionData);
				} else {
					toast.success('Password reset email sent, please check your inbox');
				}
				closeModal();
				return;
			}

			setError(data.message || 'Invalid credentials');
		} catch (error) {
			console.error('Error in sign in:', error);
			setError('No connection to server');
		}
	};

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
