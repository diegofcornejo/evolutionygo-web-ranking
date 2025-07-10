import type { Room } from '../../types/Room';
import { roomsStore } from './roomsStore';

export const addRoom = (room: Room) => {
  const currentRooms = roomsStore.get();
  const roomExists = currentRooms.some(_room => _room.id === room.id);

  if (roomExists) return;

  roomsStore.set([...currentRooms, room]);
};

export const deleteRoom = (room: Room) => {
  roomsStore.set(roomsStore.get().filter(_room => _room.id !== room.id));
};

export const updateRoom = (room: Room) => {
  roomsStore.set(roomsStore.get().map(_room => {
    if (_room.id === room.id) {
      return room;
    }
    return _room;
  }))
};

export const listRooms = (rooms: Room[]) => {
  const uniqueRooms = Array.from(new Map(rooms.map(room => [room.id, room])).values());
  roomsStore.set(uniqueRooms);
};