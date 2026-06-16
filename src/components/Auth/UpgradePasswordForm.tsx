import { useState } from 'react';
import { isPasswordValid } from '@utils/passwordPolicy';
import { getSession, updateSession } from '@stores/sessionStore';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { AuthErrorMessage } from './FormFields';

export function UpgradePasswordForm() {
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);

	const passwordValid = isPasswordValid(password);
	const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
	const canSubmit = passwordValid && passwordsMatch;

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// defense-in-depth: bail out if not eligible
		const session = getSession();
		if (!session.isLoggedIn || !session.mustUpgrade) return;

		setError(null);

		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/upgrade-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.token}`,
				},
				body: JSON.stringify({ password }),
			});

			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				updateSession({ ...session, token: data.token, mustUpgrade: false });
				window.location.replace('/');
				return;
			}

			setError(data.message || 'Password upgrade failed');
		} catch {
			setError('No connection to server');
		}
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<label className="input input-bordered flex items-center gap-2 w-full">
				<input
					type="password"
					className="grow"
					name="password"
					placeholder="New Password"
					aria-label="New Password"
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
					placeholder="Confirm Password"
					aria-label="Confirm Password"
					value={confirmPassword}
					onChange={(e) => setConfirmPassword(e.target.value)}
					required
				/>
			</label>

			{confirmPassword.length > 0 && !passwordsMatch && (
				<p className="text-error text-xs">Passwords do not match</p>
			)}

			<AuthErrorMessage message={error} />

			<button
				type="submit"
				className="btn btn-primary w-full"
				disabled={!canSubmit}
			>
				Set Password
			</button>
		</form>
	);
}
