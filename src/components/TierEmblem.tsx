// Our own emblem: a faceted gem in a hexagon, one colour pair (light, dark) per tier.
const PALETTES: Record<string, [string, string]> = {
	rookie: ['#cbd5e1', '#475569'],
	bronze: ['#fdba74', '#9a3412'],
	silver: ['#f1f5f9', '#64748b'],
	gold: ['#fde68a', '#a16207'],
	platinum: ['#99f6e4', '#0f766e'],
	diamond: ['#bae6fd', '#2563eb'],
	master: ['#f5d0fe', '#7c3aed'],
};

const OUTER = 'M16 1.5 29 9v14L16 30.5 3 23V9Z';
const INNER = 'M16 7 23.5 11.5v9L16 25l-7.5-4.5v-9Z';

interface Props {
	tier: string;
	className?: string;
	/** When set, the emblem is announced with this name; otherwise it is decorative. */
	title?: string;
}

export default function TierEmblem({ tier, className = 'h-6 w-6', title }: Readonly<Props>) {
	const [light, dark] = PALETTES[tier] ?? PALETTES.rookie;
	const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true as const };

	return (
		<svg viewBox="0 0 32 32" data-tier-emblem={tier} data-c1={light} data-c2={dark} className={`shrink-0 ${className}`} {...a11y}>
			<path d={OUTER} fill={dark} stroke={light} strokeWidth={1.4} strokeLinejoin="round" />
			<path d={INNER} fill={light} opacity={0.9} />
			<path d="M16 7v18M8.5 11.5l15 9M23.5 11.5l-15 9" stroke={dark} strokeWidth={0.8} opacity={0.55} />
		</svg>
	);
}
