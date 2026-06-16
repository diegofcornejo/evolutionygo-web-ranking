import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import { AuthEmailField, AuthErrorMessage } from './FormFields';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { isPasswordValid } from '@utils/passwordPolicy';
import { updateSession } from '@stores/sessionStore';

export function SignUpForm({ dialog }: Readonly<{ dialog: string }>) {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [gamePassword, setGamePassword] = useState<string | null>(null);

	const passwordValid = isPasswordValid(password);
	const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
	const canSubmit = passwordValid && passwordsMatch;

	const cleanForm = () => {
		setEmail('');
		setUsername('');
		setPassword('');
		setConfirmPassword('');
		setError(null);
		setGamePassword(null);
	};

	const closeModal = () => {
		const modal = document.getElementById(dialog) as HTMLDialogElement;
		if (modal) {
			modal.close();
			cleanForm();
		}
	};

	const handleSubmit = async (event: { preventDefault: () => void }) => {
		event.preventDefault();

		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, username, password }),
			});

			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				updateSession({
					token: data.token,
					user: { id: data.id, username: data.username },
					isLoggedIn: true,
					mustUpgrade: false,
				});
				setGamePassword(data.gamePassword ?? null);
				return;
			}

			if (response.status === 409) {
				setError('Email or username already in use');
				return;
			}

			setError(data.message || 'Error in registration');
		} catch (err) {
			console.error('Error in registration:', err);
			setError('No connection to server');
		}
	};

	if (gamePassword !== null) {
		return (
			<div className="space-y-4">
				<h2 className="text-xl font-bold">Your account is ready!</h2>
				<div className="flex items-center gap-3">
					<code
						data-testid="game-pin-value"
						className="font-mono text-2xl font-bold"
					>
						{gamePassword}
					</code>
					<button
						type="button"
						className="btn btn-sm btn-outline"
						onClick={() => void navigator.clipboard.writeText(gamePassword)}
					>
						Copy
					</button>
				</div>
				<p role="alert" className="text-warning text-sm">
					This is your dueling PIN. It&apos;s shown only once. Save it now — you&apos;ll need it to play on external clients like EDOpro. You can regenerate it anytime from Settings.
				</p>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => { window.location.href = '/'; }}
				>
					Continue
				</button>
			</div>
		);
	}

	return (
		<form className='space-y-4' onSubmit={handleSubmit}>
			<AuthEmailField value={email} onChange={setEmail} />
			<label className="input input-bordered flex items-center gap-2 w-full">
				<ReactSVG src='/icons/username.svg' className='w-4 h-4 opacity-70'/>
				<input
					type="text"
					className="grow"
					placeholder="Username"
					value={username}
					maxLength={14}
					onChange={(e) => setUsername(e.target.value)}
					required
					aria-label="Username"
				/>
			</label>
			<label className="input input-bordered flex items-center gap-2 w-full">
				<input
					type="password"
					className="grow"
					name="password"
					placeholder="Password"
					aria-label="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
			</label>
			<PasswordStrengthMeter password={password} />
			<label className="input input-bordered flex items-center gap-2 w-full">
				<input
					type="password"
					className="grow"
					name="confirmPassword"
					placeholder="Confirm password"
					aria-label="Confirm password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
			</label>
			{confirmPassword.length > 0 && !passwordsMatch && (
				<p className="text-error text-xs">Passwords do not match</p>
			)}
			<AuthErrorMessage message={error} />
			<p className="text-xs text-base-content/60">
				This password is for your web account. You'll generate a separate dueling PIN from your profile to play on external clients.
			</p>
			<div className='flex justify-end gap-2'>
				<button
					className="btn btn-primary"
					type="submit"
					disabled={!canSubmit}
					data-umami-event='signup-submit'
				>
					Register
				</button>
				<button className="btn btn-outline" type="button" onClick={closeModal} data-umami-event='signup-close'>Close</button>
			</div>
		</form>
	);
}
