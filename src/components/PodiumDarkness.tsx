import { useId } from 'react';
import { usePrefersReducedMotion } from '@utils/usePrefersReducedMotion';

// Dark fog banks in the brand's purples, in the spirit of a duel fought in the shadows.
const FOG_BANKS = [
	{ animation: 'animate-fog-c', className: '-left-[25%] -top-[15%] h-[65%] bg-[radial-gradient(closest-side,#3d1873,transparent)]' },
	{ animation: 'animate-fog-b', className: '-right-[55%] top-[30%] h-[60%] bg-[radial-gradient(closest-side,#2c1d6b,transparent)]' },
	{ animation: 'animate-fog-a', className: '-left-[45%] -bottom-[15%] h-[70%] bg-[radial-gradient(closest-side,#5b2a9e,transparent)]' },
];

// Soft edges on every side, so the panel reads as a clearing in the page rather than a box.
const CLEARING_MASK =
	'[mask-image:linear-gradient(to_bottom,transparent,#000_12%,#000_85%,transparent),linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] [mask-composite:intersect]';

/**
 * The darkness under the page, seen through the ranking panel. The fog layer is fixed to the viewport
 * and clipped to the panel, so it stays put while the page scrolls over it. Everything moves with
 * `transform` only, so the compositor does the work. Still under reduced motion.
 */
export default function PodiumDarkness() {
	const reduceMotion = usePrefersReducedMotion();
	const filterId = `podium-mist-${useId().replace(/[^\w-]/g, '')}`;
	const animate = (name: string) => (reduceMotion ? '' : name);

	return (
		<div
			aria-hidden="true"
			data-podium-darkness
			data-motion={reduceMotion ? 'still' : 'drift'}
			className={`pointer-events-none absolute inset-y-0 -inset-x-4 [clip-path:inset(0)] ${CLEARING_MASK}`}
		>
			<div data-darkness-veil className="fixed inset-0 overflow-hidden bg-[#0a0713]">
				{FOG_BANKS.map(({ animation, className }) => (
					<div
						key={animation}
						data-darkness-fog
						className={`absolute w-[150%] rounded-full opacity-90 blur-[40px] ${className} ${animate(animation)}`}
					/>
				))}
				<svg
					data-darkness-mist
					viewBox="0 0 400 400"
					preserveAspectRatio="none"
					className={`absolute -inset-[15%] h-[130%] w-[130%] opacity-60 mix-blend-screen ${animate('animate-mist')}`}
				>
					<filter id={filterId}>
						<feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={3} seed={7} />
						<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0 0.85  0 0 0 1.4 -0.55" />
					</filter>
					<rect width="400" height="400" filter={`url(#${filterId})`} />
				</svg>
			</div>
		</div>
	);
}

/** A slow glow behind the #1 card, so the first place stands out of the darkness. */
export function PodiumGlow() {
	const reduceMotion = usePrefersReducedMotion();

	return (
		<div
			aria-hidden="true"
			data-podium-glow
			className={`pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(120vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.38)_0%,rgb(76_29_149/0.22)_35%,transparent_70%)] ${
				reduceMotion ? '' : 'animate-glow-breathe'
			}`}
		/>
	);
}
