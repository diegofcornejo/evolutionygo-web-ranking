import { useState } from 'react';
import { toast } from 'sonner';
import { ReactSVG } from 'react-svg'

export default function LoginForm({ dialog }: { dialog: string }) {
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
		console.log(email, username);
		if (email === 'admin@admin.com' && username === 'admin') {
			toast.success('Login successful', {
				position: 'bottom-center',
			});
			closeModal();
		} else {
			setError('Invalid credentials');
		}



		// try {
		// 	const response = await fetch('https://api.evolutionygo/login', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({ email, password })
		// 	});

		// 	const data = await response.json();

		// 	if (response.ok) {
		// 		console.log('Login exitoso:', data);
		// 	} else {
		// 		setError(data.message || 'Error en el inicio de sesión');
		// 	}
		// } catch (error) {
		// 	setError('No se pudo conectar con el servidor');
		// 	console.error('Error en el login:', error);
		// }
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
					onChange={(e) => setUsername(e.target.value)}
					required
				/>
			</label>
			<p className={`text-error h-4 transition-opacity duration-300 ${!error ? 'opacity-0' : 'opacity-100'
				}`}>
				{error || ' '}
			</p>
			<div className='flex justify-end gap-2'>
				<button className="btn btn-primary" type="submit">Sign up</button>
				<button className="btn btn-outline" type="button" onClick={closeModal}>Close</button>
			</div>
		</form>
	);
}
