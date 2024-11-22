interface Props {
	rating: number;
	size?: 'sm' | 'md' | 'lg';
}

export default function Rating({ rating, size = 'md' }: Props) {
	return (
		<div className={`rating rating-${size}`}>
			{Array.from({ length: rating }).map((_, index) => (
				<input 
					key={index}
					type="radio" 
					name="rating-2" 
					className="mask mask-star-2 bg-warning pointer-events-none"
				/>
			))}
		</div>
	);
}
