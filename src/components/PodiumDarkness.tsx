import { useId } from 'react';
import { usePrefersReducedMotion } from '@utils/usePrefersReducedMotion';

// Dark fog banks in the brand's purples, in the spirit of a duel fought in the shadows.
const FOG_BANKS = [
	{ animation: 'animate-fog-c', className: '-left-[20%] -top-[10%] h-[60%] bg-[radial-gradient(closest-side,#3d1873,transparent)]' },
	{ animation: 'animate-fog-b', className: '-right-[60%] bottom-[10%] h-[70%] bg-[radial-gradient(closest-side,#2c1d6b,transparent)]' },
	{ animation: 'animate-fog-a', className: '-left-[50%] -bottom-[5%] h-[70%] bg-[radial-gradient(closest-side,#5b2a9e,transparent)]' },
];

/**
 * Drifting darkness behind the ranking podium: blurred fog banks, a noise mist and a slow glow behind
 * the first card. Everything moves with `transform` and `opacity` only, so the compositor does the
 * work. Still under reduced motion.
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
			className="pointer-events-none absolute top-1/2 left-1/2 aspect-[8/5] w-[min(170vw,46rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden [mask-image:radial-gradient(ellipse_closest-side,#000_45%,transparent)] md:w-[64rem]"
		>
			{FOG_BANKS.map(({ animation, className }) => (
				<div
					key={animation}
					data-darkness-fog
					className={`absolute w-[140%] rounded-full opacity-90 blur-[34px] ${className} ${animate(animation)}`}
				/>
			))}
			<svg
				data-darkness-mist
				viewBox="0 0 400 400"
				preserveAspectRatio="none"
				className={`absolute -inset-[20%] h-[140%] w-[140%] opacity-60 mix-blend-screen ${animate('animate-mist')}`}
			>
				<filter id={filterId}>
					<feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={3} seed={7} />
					<feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0 0.85  0 0 0 1.4 -0.55" />
				</filter>
				<rect width="400" height="400" filter={`url(#${filterId})`} />
			</svg>
			<div
				data-darkness-glow
				className={`absolute top-1/2 left-1/2 aspect-square w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(124_58_237/0.33)_0%,rgb(76_29_149/0.2)_35%,transparent_70%)] ${animate('animate-glow-breathe')}`}
			/>
		</div>
	);
}
