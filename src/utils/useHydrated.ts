import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards. Lets a component render the same text
 * on both sides first (e.g. a date in UTC) and switch to something browser-only (the viewer's time zone) after.
 */
export const useHydrated = () =>
	useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
