import type { Room } from '../../types/Room';
import { roomsStore } from './roomsStore';

export const addRoom = (room: Room) => {
  roomsStore.set([...roomsStore.get(), room]);
};

export const deleteRoom = (room: Room) => {
  roomsStore.set(roomsStore.get().filter(r => r.id !== room.id));
};

export const updateRoom = (room: Room) => {
  roomsStore.set(roomsStore.get().map(r => r.id === room.id ? room : r));
};

export const listRooms = (rooms: Room[]) => {
  roomsStore.set(rooms);
};