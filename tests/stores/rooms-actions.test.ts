import { describe, it, expect, vi } from 'vitest';
import type { Room } from '../../src/types/Room';

vi.mock('../../src/stores/rooms/roomsStore.ts', () => ({
  roomsStore: {
    get: vi.fn(() => [] as Room[]),
    set: vi.fn(),
  },
}));

const getRoomsStore = async () => await import('../../src/stores/rooms/roomsStore.ts') as {
  roomsStore: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
};

import { addRoom, deleteRoom, updateRoom, listRooms } from '../../src/stores/rooms/rooms-actions';

const roomA = {
  id: 1,
  turn: 1,
  bestOf: 3,
  notes: '',
  banList: { name: 'Global' },
  players: [],
} as Room;

const roomB = {
  id: 2,
  turn: 1,
  bestOf: 3,
  notes: '',
  banList: { name: 'Global' },
  players: [],
} as Room;

describe('rooms-actions', () => {
  it('adds room when missing', async () => {
    const { roomsStore } = await getRoomsStore();
    roomsStore.get.mockReturnValue([]);

    addRoom(roomA);

    expect(roomsStore.set).toHaveBeenCalledWith([roomA]);
  });

  it('prevents adding duplicates', async () => {
    const { roomsStore } = await getRoomsStore();
    roomsStore.get.mockReturnValue([roomA]);
    roomsStore.set.mockClear();

    addRoom(roomA);

    expect(roomsStore.set).not.toHaveBeenCalled();
  });

  it('deletes a room by id', async () => {
    const { roomsStore } = await getRoomsStore();
    roomsStore.get.mockReturnValue([roomA, roomB]);

    deleteRoom(roomA);

    expect(roomsStore.set).toHaveBeenCalledWith([roomB]);
  });

  it('updates room by id', async () => {
    const { roomsStore } = await getRoomsStore();
    roomsStore.get.mockReturnValue([roomA]);

    updateRoom({
      id: 1,
      turn: 2,
      bestOf: 3,
      notes: 'Updated',
      banList: { name: 'Global' },
      players: [],
    } as Room);

    expect(roomsStore.set).toHaveBeenCalled();
  });

  it('lists rooms with unique ids', async () => {
    const { roomsStore } = await getRoomsStore();

    listRooms([roomA, roomA, roomB]);
    expect(roomsStore.set).toHaveBeenCalledWith([roomA, roomB]);
  });
});
