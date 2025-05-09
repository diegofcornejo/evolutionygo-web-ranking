import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import { toast } from 'sonner';
import type { Session } from '@types';
import { updateSession } from '@stores/sessionStore';

export function SignInForm({ dialog }: Readonly<{ dialog: string }>) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [forgotPassword, setForgotPassword] = useState(false);

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
		setForgotPassword(!forgotPassword);
		cleanForm();
	}

	const handleSubmit = async (event: { preventDefault: () => void; }) => {
		event.preventDefault();

		try {
			const endpoint = forgotPassword
				? `users/forgot-password`
				: `users/login`;

			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, ...(forgotPassword ? {} : { password }) })
			});

			const data = await response.json();

			if (response.ok) {
				if (!forgotPassword) {
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
			} else {
				setError(data.message || 'Error in request');
			}
		} catch (error) {
			setError('No connection to server');
		}
	};

	return (
		<form className='space-y-4' onSubmit={handleSubmit}>
			<label className="input input-bordered flex items-center gap-2 w-full">
				<ReactSVG src='/icons/email.svg' className='w-4 h-4 opacity-70' />
				<input
					type="text"
					className="grow"
					name="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
				/>
			</label>

			{!forgotPassword && (
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
					/>
				</label>
			)}

			<p className={`text-error text-xs h-4 transition-opacity duration-300 ${!error ? 'opacity-0' : 'opacity-100'}`}>
				{error || ' '}
			</p>

			<p className='text-xs'>
				<a className='cursor-pointer' onClick={switchForm} id='forgot-password-link'>{forgotPassword ? 'Back to Sign In' : 'Forgot password?'}</a>
			</p>

			<div className='flex justify-end gap-2'>
				{!forgotPassword && (
					<button className="btn btn-primary" type="submit" data-umami-event='signin-submit'>
						Sign in
					</button>
				)}
				{forgotPassword && (
					<button className="btn btn-primary" type="submit" data-umami-event='forgot-password-submit'>
						Reset Password
					</button>
				)}
				<button className="btn btn-outline" type="button" onClick={closeModal} data-umami-event='signin-close'>Close</button>
			</div>
		</form>
	);
}
