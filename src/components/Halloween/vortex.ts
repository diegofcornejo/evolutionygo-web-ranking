/**
 * "Duel in the dark" pulls the home into a Shadow Realm vortex before leaving
 * for the game. Transform and opacity only, driven by the Web Animations API.
 */

export const VORTEX_MS = 5000;
export const VORTEX_VIEWBOX = '-100 -100 200 200';

/** Logarithmic spiral arms around the origin, out to the edge of VORTEX_VIEWBOX. */
export function spiralArms(count = 6, growth = 0.3, start = 2): string[] {
	const end = Math.log(100 / start) / growth;
	return Array.from({ length: count }, (_, arm) => {
		const turn = (arm / count) * Math.PI * 2;
		const points: string[] = [];
		for (let theta = 0; theta <= end; theta += 0.05) {
			const r = start * Math.exp(growth * theta);
			points.push(`${(r * Math.cos(theta + turn)).toFixed(1)} ${(r * Math.sin(theta + turn)).toFixed(1)}`);
		}
		return `M${points.join('L')}`;
	});
}

/** Plain left clicks fall in; modified clicks open a tab as usual and reduced motion skips the show. */
export function shouldFall(event: MouseEvent, reducedMotion: boolean): boolean {
	return (
		!reducedMotion &&
		!event.defaultPrevented &&
		event.button === 0 &&
		!event.metaKey &&
		!event.ctrlKey &&
		!event.shiftKey &&
		!event.altKey
	);
}

const EASE_IN = 'cubic-bezier(0.55, 0, 1, 0.45)';

/**
 * Twists the page into the vortex and calls `onDone` once it is swallowed.
 * Returns a reset for pages restored from the back/forward cache.
 */
export function fallIntoVortex(overlay: HTMLElement, onDone: () => void): () => void {
	const cx = innerWidth / 2;
	const cy = innerHeight / 2;
	const page = [...document.body.children].filter(
		(child): child is HTMLElement => child instanceof HTMLElement && child !== overlay && !['SCRIPT', 'STYLE', 'TEMPLATE'].includes(child.tagName)
	);
	document.body.append(overlay);
	overlay.classList.add('is-falling');
	document.documentElement.style.overflow = 'hidden';

	const timing = { duration: VORTEX_MS, fill: 'forwards' } as const;
	const part = (selector: string) => overlay.querySelector<HTMLElement | SVGElement>(selector);
	const animations = [
		...page.map((element) => {
			const box = element.getBoundingClientRect();
			element.style.transformOrigin = `${cx - box.left}px ${cy - box.top}px`;
			return element.animate(
				[
					{ transform: 'none', opacity: 1 },
					{ transform: 'rotate(200deg) scale(0.05)', opacity: 0 },
				],
				{ ...timing, duration: VORTEX_MS * 0.8, easing: EASE_IN }
			);
		}),
		overlay.animate([{ opacity: 0 }, { opacity: 1 }], { ...timing, duration: VORTEX_MS * 0.6, easing: 'ease-in' }),
		part('[data-vortex-swirl]')?.animate(
			[{ transform: 'rotate(0turn) scale(0.3)' }, { transform: 'rotate(3turn) scale(1.4)' }],
			{ ...timing, easing: EASE_IN }
		),
		part('[data-vortex-bands]')?.animate(
			[{ transform: 'rotate(0turn)' }, { transform: 'rotate(-1.5turn)' }],
			{ ...timing, easing: EASE_IN }
		),
		part('[data-vortex-core]')?.animate(
			[
				{ transform: 'scale(0)', opacity: 0 },
				{ transform: 'scale(0.4)', opacity: 0.6, offset: 0.6 },
				{ transform: 'scale(1.2)', opacity: 1, offset: 0.85 },
				{ transform: 'scale(6)', opacity: 1 },
			],
			timing
		),
		part('[data-vortex-void]')?.animate([{ opacity: 0 }, { opacity: 0, offset: 0.85 }, { opacity: 1 }], timing),
	];
	const done = setTimeout(onDone, VORTEX_MS);

	return () => {
		clearTimeout(done);
		for (const animation of animations) animation?.cancel();
		for (const element of page) element.style.transformOrigin = '';
		overlay.classList.remove('is-falling');
		document.documentElement.style.overflow = '';
	};
}
