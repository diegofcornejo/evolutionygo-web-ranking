import type { WatchRoom } from '../../types/WatchRoom';
import { atom, computed } from 'nanostores';

export type WatchRoomsStatus = 'idle' | 'loading' | 'ready' | 'error';

export const watchRoomsStore = atom<WatchRoom[]>([]);
export const watchRoomsStatus = atom<WatchRoomsStatus>('idle');

export const watchableRoomIds = computed(watchRoomsStore, (rooms) =>
	new Set(rooms.map((room) => room.id)),
);
