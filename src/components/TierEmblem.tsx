// The official rank art from the evolution-cosmetics repository (brand/ranks), copied to public/ranks.
const TIERS = new Set(['rookie', 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']);
const SIZES = [32, 64, 128, 256];

interface Props {
	tier: string;
	className?: string;
	/** Rendered size in CSS pixels, so the browser downloads the closest export. */
	size?: number;
	/** When set, the emblem is announced with this name; otherwise it is decorative. */
	title?: string;
}

export default function TierEmblem({ tier, className = 'h-6 w-6', size = 24, title }: Readonly<Props>) {
	const art = TIERS.has(tier) ? tier : 'rookie';
	const a11y = title ? { alt: title } : { alt: '', 'aria-hidden': true as const };

	return (
		<img
			src={`/ranks/${art}-64.webp`}
			srcSet={SIZES.map((px) => `/ranks/${art}-${px}.webp ${px}w`).join(', ')}
			sizes={`${size}px`}
			width={size}
			height={size}
			loading="lazy"
			decoding="async"
			data-tier-emblem={tier}
			className={`shrink-0 object-contain ${className}`}
			{...a11y}
		/>
	);
}
