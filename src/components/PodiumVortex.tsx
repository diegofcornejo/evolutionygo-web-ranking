import { spiralArms } from '@utils/spiral';
import { usePrefersReducedMotion } from '@utils/usePrefersReducedMotion';

// The same logarithmic spiral as the Halloween "Duel in the dark" vortex, in the brand's purple and blue.
const ARMS = spiralArms(6);
const THIN_STROKES = ['rgb(189 36 223 / 0.7)', 'rgb(70 130 255 / 0.7)'];

/**
 * A slow swirl behind the ranking podium. Built from a CSS conic gradient and an SVG, rotated with
 * `transform` so the compositor does the work; it never repaints a canvas. Still under reduced motion.
 */
export default function PodiumVortex() {
	const reduceMotion = usePrefersReducedMotion();
	const spin = reduceMotion ? '' : 'animate-vortex';
	const counterSpin = reduceMotion ? '' : 'animate-vortex-reverse';

	return (
		<div
			aria-hidden="true"
			data-podium-vortex
			data-motion={reduceMotion ? 'still' : 'spin'}
			className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[min(150vw,40rem)] -translate-x-1/2 -translate-y-1/2 [mask-image:radial-gradient(circle,#000_28%,transparent_68%)] md:w-[48rem]"
		>
			<div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,#2a1a5e_0%,#160f33_45%,transparent_70%)]" />
			<div
				data-vortex-bands
				className={`absolute inset-0 rounded-full bg-[repeating-conic-gradient(from_0deg,transparent_0deg_12deg,rgb(124_58_237/0.32)_17deg,transparent_25.7deg)] ${counterSpin}`}
			/>
			<svg data-vortex-arms viewBox="-100 -100 200 200" className={`absolute inset-0 h-full w-full ${spin}`}>
				<g fill="none" strokeLinecap="round">
					{ARMS.map((arm) => (
						<path key={`wide-${arm.slice(0, 16)}`} d={arm} stroke="rgb(124 58 237 / 0.35)" strokeWidth={6} />
					))}
					{ARMS.map((arm, index) => (
						<path key={`thin-${arm.slice(0, 16)}`} d={arm} stroke={THIN_STROKES[index % 2]} strokeWidth={1.1} />
					))}
				</g>
			</svg>
			<div
				data-vortex-core
				className="absolute inset-[38%] rounded-full bg-[radial-gradient(circle,rgb(196_181_253/0.55)_0%,rgb(124_58_237/0.25)_45%,transparent_70%)]"
			/>
		</div>
	);
}
