import { useEffect, useState } from 'react';
import { ReactSVG } from 'react-svg';
import { toast } from 'sonner';
import { logout } from '@components/NavBar/helper';
import { getSession } from '@stores/sessionStore';
import { isPasswordValid } from '@utils/passwordPolicy';
import { PasswordStrengthMeter } from '@components/Auth/PasswordStrengthMeter';

type PinState = 'idle' | 'generating' | 'shown' | 'error';

export default function SettingsForm({ dialog }: Readonly<{ dialog: string }>) {
	// Section 1: Change Username
	const [username, setUsername] = useState('');
	const [usernameError, setUsernameError] = useState<string | null>(null);

	// Section 2: Change Account Password
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmNewPassword, setConfirmNewPassword] = useState('');
	const [passwordError, setPasswordError] = useState<string | null>(null);

	// Section 3: Game PIN state machine
	const [pinState, setPinState] = useState<PinState>('idle');
	const [gamePin, setGamePin] = useState<string | null>(null);
	const [pinError, setPinError] = useState<string | null>(null);

	// Derived values (in render — vercel-react-best-practices)
	const newPasswordValid = isPasswordValid(newPassword);
	const newPasswordsMatch = newPassword === confirmNewPassword && confirmNewPassword.length > 0;
	const canSubmitPassword = currentPassword.length > 0 && newPasswordValid && newPasswordsMatch;
	const hasUsernameError = Boolean(usernameError);
	const hasPasswordError = Boolean(passwordError);

	const closeModal = () => {
		const modal = document.getElementById(dialog) as HTMLDialogElement;
		if (modal) {
			modal.close();
		}
	};

	// Reset all state whenever the dialog closes (✕, backdrop, ESC or programmatic).
	// Prevents the one-time game PIN and entered passwords from lingering in memory
	// and being shown again on the next open without a reload.
	useEffect(() => {
		const modal = document.getElementById(dialog);
		if (!modal?.addEventListener) return;
		const handleClose = () => {
			setUsername('');
			setUsernameError(null);
			setCurrentPassword('');
			setNewPassword('');
			setConfirmNewPassword('');
			setPasswordError(null);
			setPinState('idle');
			setGamePin(null);
			setPinError(null);
		};
		modal.addEventListener('close', handleClose);
		return () => modal.removeEventListener('close', handleClose);
	}, [dialog]);

	// ── Section 1: Change Username ────────────────────────────────────────────
	const handleSaveUsername = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setUsernameError(null);

		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/change-username`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${getSession().token}`,
				},
				body: JSON.stringify({ username }),
			});

			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				setUsername('');
				setUsernameError(null);
				logout();
				closeModal();
				toast.success('Updated successfully, please login again', {
					position: 'bottom-center',
				});
			} else {
				setUsernameError((data as { message?: string }).message || 'Error updating');
			}
		} catch {
			setUsernameError('No connection to server');
		}
	};

	// ── Section 2: Change Account Password ───────────────────────────────────
	const handleSavePassword = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!canSubmitPassword) return;
		setPasswordError(null);

		try {
			const response = await fetch(
				`${import.meta.env.PUBLIC_API_URL}/users/change-account-password`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${getSession().token}`,
					},
					body: JSON.stringify({ currentPassword, newPassword }),
				},
			);

			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				sessionStorage.setItem('flash', 'password-changed');
				logout();
				window.location.href = '/login';
			} else {
				setPasswordError((data as { message?: string }).message || 'Error updating password');
			}
		} catch {
			setPasswordError('No connection to server');
		}
	};

	// ── Section 3: Generate Game PIN ─────────────────────────────────────────
	const handleGeneratePin = async () => {
		setPinState('generating');
		setGamePin(null);
		setPinError(null);

		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/game-password`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${getSession().token}`,
				},
			});

			const data = await response.json().catch(() => ({}));

			if (response.ok) {
				setGamePin((data as { gamePassword: string }).gamePassword);
				setPinState('shown');
			} else {
				setPinError((data as { message?: string }).message || 'Error generating PIN');
				setPinState('error');
			}
		} catch {
			setPinError('No connection to server');
			setPinState('error');
		}
	};

	const handleCopyPin = async () => {
		if (gamePin === null) return;
		try {
			await navigator.clipboard.writeText(gamePin);
			toast.success('PIN copied', { position: 'bottom-center' });
		} catch {
			toast.error('Could not copy — copy it manually', { position: 'bottom-center' });
		}
	};

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
			{/* Left column (desktop): Change Account Password */}
			<div className="order-2 md:order-1">
				<h3 className="divider">Change Account Password</h3>
				<form className="space-y-2 mt-8" onSubmit={handleSavePassword}>
					<label className="input input-bordered flex items-center gap-2 w-full">
						<ReactSVG src="/icons/password.svg" className="w-4 h-4 opacity-70" />
						<input
							type="password"
							className="grow"
							placeholder="Current Password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							required
						/>
					</label>
					<label className="input input-bordered flex items-center gap-2 w-full">
						<ReactSVG src="/icons/password.svg" className="w-4 h-4 opacity-70" />
						<input
							type="password"
							className="grow"
							placeholder="New Password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							required
						/>
					</label>
					<PasswordStrengthMeter password={newPassword} />
					<label className="input input-bordered flex items-center gap-2 w-full">
						<ReactSVG src="/icons/password.svg" className="w-4 h-4 opacity-70" />
						<input
							type="password"
							className="grow"
							placeholder="Confirm New Password"
							value={confirmNewPassword}
							onChange={(e) => setConfirmNewPassword(e.target.value)}
							required
						/>
					</label>
					{confirmNewPassword.length > 0 && !newPasswordsMatch && (
						<p className="text-error text-xs">Passwords do not match</p>
					)}
					<p
						className={`text-error text-xs h-4 transition-opacity duration-300 ${hasPasswordError ? 'opacity-100' : 'opacity-0'}`}
					>
						{passwordError || ' '}
					</p>
					<button
						className="btn btn-primary btn-sm"
						type="submit"
						disabled={!canSubmitPassword}
					>
						Save Password
					</button>
				</form>
			</div>

			{/* Right column (desktop): Change Username + Generate Game PIN */}
			<div className="order-1 md:order-2 space-y-10">
				{/* Section: Change Username */}
				<div>
					<h3 className="divider">Change Username</h3>
					<form className="space-y-2 mt-8" onSubmit={handleSaveUsername}>
						<label className="input input-bordered flex items-center gap-2 w-full">
							<ReactSVG src="/icons/username.svg" className="w-4 h-4 opacity-70" />
							<input
								type="text"
								className="grow"
								placeholder="New Username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</label>
						<p
							className={`text-error text-xs h-4 transition-opacity duration-300 ${hasUsernameError ? 'opacity-100' : 'opacity-0'}`}
						>
							{usernameError || ' '}
						</p>
						<button className="btn btn-primary btn-sm" type="submit">
							Save
						</button>
					</form>
				</div>

				{/* Section: Generate Game PIN */}
				<div>
					<h3 className="divider">Generate Game PIN</h3>
					<p className="text-sm text-base-content/70 mt-6">
						Your dueling PIN lets external clients (like EDOpro) connect to the Evolution server. Generate one whenever you need it. It is shown only once, and generating a new one replaces the previous PIN.
					</p>
					<div className="mt-8 space-y-4">
						{pinState === 'shown' && gamePin !== null ? (
							<>
								<div className="flex items-center gap-3">
									<code
										data-testid="game-pin-value"
										className="font-mono text-2xl font-bold"
									>
										{gamePin}
									</code>
									<button
										type="button"
										className="btn btn-sm btn-outline"
										onClick={handleCopyPin}
									>
										Copy
									</button>
								</div>
								<p role="alert" className="text-warning text-xs">
									This PIN is shown only once. Save it before closing.
								</p>
							</>
						) : null}
						{pinState === 'error' ? (
							<p role="alert" className="text-error text-xs">
								{pinError}
							</p>
						) : null}
						<button
							type="button"
							className="btn btn-primary btn-sm"
							onClick={handleGeneratePin}
							disabled={pinState === 'generating'}
						>
							{pinState === 'generating'
								? 'Generating...'
								: pinState === 'shown'
								? 'Regenerate PIN'
								: 'Generate dueling PIN'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
