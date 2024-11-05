import { useState } from 'react';
import { ReactSVG } from 'react-svg'
import { isLoggedIn } from '../../stores/sessionStore';

export default function LoginForm({ dialog }: { dialog: string }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);


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

	const handleSubmit = async (event: { preventDefault: () => void; }) => {
		event.preventDefault();
		console.log(email, password);

		try {
			console.log(import.meta.env.PUBLIC_API_URL);
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});

			if (response.ok) {
				const data = await response.text();
				isLoggedIn.set(true);
				console.log('Login successful:', data);
				closeModal();
			} else {
				const data = await response.json()
				setError(data.message || 'Error in login');
			}
		} catch (error) {
			setError('No connection to server');
			console.error('Error in login:', error);
		}
	};

	return (
		<form className='space-y-4' onSubmit={handleSubmit}>
			<label className="input input-bordered flex items-center gap-2">
				<ReactSVG src='/icons/email.svg' className='w-4 h-4 opacity-70'/>
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
			<label className="input input-bordered flex items-center gap-2">
				<ReactSVG src='/icons/password.svg' className='w-4 h-4 opacity-70'/>
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
			<p className={`text-error h-4 transition-opacity duration-300 ${!error ? 'opacity-0' : 'opacity-100'
				}`}>
				{error || ' '}
			</p>
			<div className='flex justify-end gap-2'>
				<button className="btn btn-primary" type="submit">Sign in</button>
				<button className="btn btn-outline" type="button" onClick={closeModal}>Close</button>
			</div>
		</form>
	);
}
