import { useState } from 'react';
import { ReactSVG } from 'react-svg';
import { toast } from 'sonner';
import { handleLogout } from '@components/NavBar/helper';
import { getSession } from '@stores/sessionStore';

export default function SettingsForm({ dialog }: { dialog: string }) {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [usernameError, setUsernameError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const cleanForm = () => {
		setUsername('');
		setPassword('');
		setNewPassword('');
		setUsernameError(null);
		setPasswordError(null);
	};

	const closeModal = () => {
		const modal = document.getElementById(dialog) as HTMLDialogElement;
		if (modal) {
			modal.close();
			cleanForm();
		}
	};


	const handleSave = async (endpoint: string, value: any, setError: (error: string | null) => void) => {
		setError(null);

		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/${endpoint}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${getSession().token}`,
				},
				body: JSON.stringify(value),
			});

			if (response.ok) {
				setError(null);
				handleLogout();
				closeModal();
				toast.success('Updated successfully, please login again', {
					position: 'bottom-center',
				});
			} else {
				const data = await response.json();
				setError(data.message || 'Error updating');
			}
		} catch (error) {
			console.error(error);
			setError('No connection to server');
		}
	};

	return (
		<div className="">
			<div className="space-y-2">
				<h2 className="font-bold">Change Username</h2>
				<label className="input input-bordered flex items-center gap-2">
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
					className={`text-error text-sm h-4 transition-opacity duration-300 ${!usernameError ? 'opacity-0' : 'opacity-100'
						}`}
				>
					{usernameError || ' '}
				</p>
				<button
					className="btn btn-primary btn-sm"
					onClick={() => handleSave('users/change-username', username, setUsernameError)}
				>
					Save Username
				</button>
			</div>

			<div className="space-y-2 mt-16">
				<h2 className="font-bold">Change Password</h2>
				<label className="input input-bordered flex items-center gap-2">
					<ReactSVG src="/icons/password.svg" className="w-4 h-4 opacity-70" />
					<input
						type="password"
						className="grow"
						placeholder="Actual Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</label>
				< label className="input input-bordered flex items-center gap-2" >
					<ReactSVG src="/icons/password.svg" className="w-4 h-4 opacity-70" />
					<input
						type="password"
						className="grow"
						placeholder="New Password"
						value={newPassword}
						maxLength={4}
						onChange={(e) => setNewPassword(e.target.value)}
						required
					/>
				</label>
				<p
					className={`text-error text-sm h-4 transition-opacity duration-300 ${!passwordError ? 'opacity-0' : 'opacity-100'
						}`}
				>
					{passwordError || ' '}
				</p>
				<button
					className="btn btn-primary btn-sm"
					onClick={() => handleSave('users/reset-password', { password, newPassword }, setPasswordError)}
				>
					Save Password
				</button>
			</div>
			<div className='flex justify-end gap-2'>
				<button className="btn btn-outline" type="button" onClick={closeModal}>Close</button>
			</div>
		</div>
	);
}
