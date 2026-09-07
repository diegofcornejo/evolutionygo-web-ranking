import type { WatchRoom } from '../../types/WatchRoom';
import { isWatchableRoom, roomsApiUrl, sortWatchRooms } from '../../utils/watchLink';
import { watchRoomsStatus, watchRoomsStore } from './watchRoomsStore';

export const POLL_INTERVAL_MS = 10_000;

/**
 * Refreshes the watchable rooms listing. Rooms disappear from the listing when
 * the duel ends, so the store is replaced rather than merged.
 */
export const fetchWatchRooms = async () => {
	if (watchRoomsStatus.get() === 'idle') {
		watchRoomsStatus.set('loading');
	}

	try {
		const response = await fetch(roomsApiUrl());
		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			throw new Error(`Rooms listing failed with status ${response.status}`);
		}

		const rooms: WatchRoom[] = Array.isArray(data.rooms) ? data.rooms : [];
		watchRoomsStore.set(sortWatchRooms(rooms.filter(isWatchableRoom)));
		watchRoomsStatus.set('ready');
	} catch (error) {
		console.error('Error fetching watchable rooms:', error);
		watchRoomsStatus.set('error');
	}
};

/** Starts polling the listing and returns the stop function. */
export const startWatchRoomsPolling = (intervalMs: number = POLL_INTERVAL_MS) => {
	void fetchWatchRooms();
	const timer = setInterval(() => {
		void fetchWatchRooms();
	}, intervalMs);

	return () => clearInterval(timer);
};
