import { useState } from 'react';
import { toast } from 'sonner';
import { ReactSVG } from 'react-svg';

interface ResetPasswordFormProps {
	token: string;
}

export function ResetPasswordForm({ token }: Readonly<ResetPasswordFormProps>) {
	const [password, setPassword] = useState('');
	const [repeatPassword, setRepeatPassword] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (event: { preventDefault: () => void; }) => {
		event.preventDefault();
		if (password !== repeatPassword) {
			setError('Passwords do not match');
			return;
		}
		setError('');
		try {
			const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/users/reset-password`, {
				method: 'POST',
				body: JSON.stringify({ password }),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});
			if (response.ok) {
				toast.success('Password reset successful');
				setTimeout(() => {
					globalThis.location.href = '/login';
				}, 5000);
			} else {
				setError(response.statusText);
			}
		} catch (error) {
			console.error('Error resetting password:', error);
			setError('No connection to server');
		}
	}
	return (
		<div className='my-12 max-w-md mx-auto'>
			<div className='divider'> Password Reset</div>
			<form className='space-y-4 my-8' onSubmit={handleSubmit}>
				<label className='input input-bordered flex items-center gap-2 w-full'>
					<ReactSVG src='/icons/password.svg' className='w-4 h-4 opacity-70' />
					<input 
						type='password' 
						className='grow' 
						placeholder='New password' 
						maxLength={4} 
						value={password} 
						onChange={(e) => setPassword(e.target.value)} 
						required
					/>
				</label>
				<label className='input input-bordered flex items-center gap-2 w-full'>
					<ReactSVG src='/icons/password.svg' className='w-4 h-4 opacity-70' />
					<input 
						type='password' 
						className='grow' 
						placeholder='Repeat new password' 
						maxLength={4} 
						value={repeatPassword} 
						onChange={(e) => setRepeatPassword(e.target.value)} 
						required 
					/>
				</label>
				<button className='btn btn-primary btn-sm w-full' type='submit' data-umami-event='reset-password-submit'> Change Password </button>
			</form>
			{error && <p className='text-error text-center text-sm'>{error}</p>}
		</div>
	)
}
