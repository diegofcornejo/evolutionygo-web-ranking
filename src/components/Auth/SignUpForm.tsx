import { useState } from 'react';
import { toast } from 'sonner';
import { ReactSVG } from 'react-svg'

export function SignUpForm({ dialog }: Readonly<{ dialog: string }>) {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [error, setError] = useState<string | null>(null);


	const cleanForm = () => {
		setEmail('');
		setUsername('');
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

		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, username })
			});

			const data = await response.json();

			if (response.ok) {
				closeModal();
				toast.success('Registration successful, please verify your email', {
					position: 'bottom-center',
				});
			} else {
				setError(data.message || 'Error in registration');
			}
		} catch (error) {
			console.error('Error in registration:', error);
			setError('No connection to server');
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
				<ReactSVG src='/icons/username.svg' className='w-4 h-4 opacity-70'/>
				<input
					type="text"
					className="grow"
					placeholder="Username"
					value={username}
					maxLength={14}
					onChange={(e) => setUsername(e.target.value)}
					required
				/>
			</label>
			<p className={`text-error text-xs h-4 transition-opacity duration-300 ${!error ? 'opacity-0' : 'opacity-100'}`}>
				{error || ' '}
			</p>
			<div className='flex justify-end gap-2'>
				<button className="btn btn-primary" type="submit">Sign up</button>
				<button className="btn btn-outline" type="button" onClick={closeModal}>Close</button>
			</div>
		</form>
	);
}
