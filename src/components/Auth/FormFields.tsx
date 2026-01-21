import { ReactSVG } from 'react-svg';

interface AuthEmailFieldProps {
	value: string;
	onChange: (value: string) => void;
}

interface AuthErrorMessageProps {
	message: string | null;
}

export function AuthEmailField({ value, onChange }: Readonly<AuthEmailFieldProps>) {
	return (
		<label className="input input-bordered flex items-center gap-2 w-full">
			<ReactSVG src='/icons/email.svg' className='w-4 h-4 opacity-70' />
			<input
				type="text"
				className="grow"
				name="email"
				placeholder="Email"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required
				aria-label="Email"
			/>
		</label>
	);
}

export function AuthErrorMessage({ message }: Readonly<AuthErrorMessageProps>) {
	const hasMessage = Boolean(message);

	return (
		<p className={`text-error text-xs h-4 transition-opacity duration-300 ${hasMessage ? 'opacity-100' : 'opacity-0'}`}>
			{message || ' '}
		</p>
	);
}
