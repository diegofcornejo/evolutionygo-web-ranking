interface Props {
	rating: number;
	size?: 'sm' | 'md' | 'lg';
}

export default function Rating({ rating, size = 'md' }: Readonly<Props>) {
	return (
		<div className={`rating rating-${size}`}>
			{Array.from({ length: rating }).map((_, index) => (
				<input 
					key={index}
					type="radio" 
					// name={`rating-${rating}-${index}`} 
					className="mask mask-star-2 bg-orange-300 pointer-events-none"
					defaultChecked
				/>
			))}
		</div>
	);
}
