import { useState } from 'react';
import { toast } from 'sonner';
import { ReactSVG } from 'react-svg'
import { AuthEmailField, AuthErrorMessage } from './FormFields';

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
			<AuthErrorMessage message={error} />
			<div className='flex justify-end gap-2'>
				<button className="btn btn-primary" type="submit" data-umami-event='signup-submit'>Register</button>
				<button className="btn btn-outline" type="button" onClick={closeModal} data-umami-event='signup-close'>Close</button>
			</div>
		</form>
	);
}
