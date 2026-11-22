// Decorative illustrations from the evolution-cosmetics repository (ui/empty-states, and the
// achievements atlas), copied to public/empty-states.
export type EmptyStateName = 'history' | 'leaderboard' | 'load-error' | 'atlas';

interface Props {
	name: EmptyStateName;
	className?: string;
}

export default function EmptyStateArt({ name, className = 'h-24 w-24' }: Readonly<Props>) {
	const at = (size: number) => `/empty-states/${name}-${size}.webp`;
	return (
		<img
			src={at(128)}
			srcSet={`${at(128)} 1x, ${at(256)} 2x`}
			alt=""
			width={96}
			height={96}
			loading="lazy"
			decoding="async"
			data-empty-state={name}
			className={`mx-auto object-contain ${className}`}
		/>
	);
}
