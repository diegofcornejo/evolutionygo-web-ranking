import type { Room } from '../../types/Room';
import { atom } from 'nanostores';

export const roomsStore = atom<Room[]>([]);