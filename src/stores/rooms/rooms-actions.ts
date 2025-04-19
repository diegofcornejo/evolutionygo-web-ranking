import type { Room } from '../../types/Room';
import { roomsStore } from './roomsStore';

export const addRoom = (room: Room) => {
  roomsStore.set([...roomsStore.get(), room]);
};

export const deleteRoom = (room: Room) => {
  roomsStore.set(roomsStore.get().filter(_room => _room.id !== room.id));
};

export const updateRoom = (room: Room) => {
  roomsStore.set(roomsStore.get().map(_room => {
    if (_room.id === room.id) {
      console.log(room)
      return room;
    }
    return _room;
  }))
};

export const listRooms = (rooms: Room[]) => {
  roomsStore.set(rooms);
};