import { useEffect, useState } from 'react';

export function usePrefersReducedMotion() {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(
		() => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
		if (!mediaQuery) return;

		const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
		mediaQuery.addEventListener('change', updatePreference);
		return () => mediaQuery.removeEventListener('change', updatePreference);
	}, []);

	return prefersReducedMotion;
}
