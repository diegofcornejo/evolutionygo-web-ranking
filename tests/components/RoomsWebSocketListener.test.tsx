import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoomsWebSocketListener } from '@components/RoomsWebSocketListener';

vi.stubEnv('PUBLIC_WEBSOCKET_URL', 'ws://localhost:1234');

const instances: MockWebSocket[] = [];

class MockWebSocket {
  static OPEN = 1;
  readyState = MockWebSocket.OPEN;
  handlers = new Map<string, (event?: any) => void>();
  close = vi.fn();

  constructor(public url: string) {
    instances.push(this);
  }

  addEventListener = (event: string, handler: (event?: any) => void) => {
    this.handlers.set(event, handler);
  };

  trigger(event: string, payload?: any) {
    this.handlers.get(event)?.(payload);
  }
}

vi.stubGlobal('WebSocket', MockWebSocket);

vi.mock('@stores/rooms/rooms-actions', () => ({
  addRoom: vi.fn(),
  deleteRoom: vi.fn(),
  updateRoom: vi.fn(),
  listRooms: vi.fn(),
}));

describe('RoomsWebSocketListener', () => {
  beforeEach(() => {
    instances.length = 0;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('connects and handles room events', async () => {
    render(<RoomsWebSocketListener />);

    const socket = instances[0];
    expect(socket).toBeDefined();

    socket.trigger('message', { data: JSON.stringify({ action: 'ADD-ROOM', data: { id: '1' } }) });
    socket.trigger('message', { data: JSON.stringify({ action: 'UPDATE-ROOM', data: { id: '1' } }) });
    socket.trigger('message', { data: JSON.stringify({ action: 'REMOVE-ROOM', data: { id: '1' } }) });
    socket.trigger('message', { data: JSON.stringify({ action: 'GET-ROOMS', data: [{ id: '1' }] }) });

    const roomsActions = await import('@stores/rooms/rooms-actions');
    expect(roomsActions.addRoom).toHaveBeenCalled();
    expect(roomsActions.updateRoom).toHaveBeenCalled();
    expect(roomsActions.deleteRoom).toHaveBeenCalled();
    expect(roomsActions.listRooms).toHaveBeenCalled();
  });

  it('reconnects after close', () => {
    vi.useFakeTimers();
    render(<RoomsWebSocketListener />);

    const socket = instances[0];
    socket.trigger('close');

    vi.advanceTimersByTime(3000);

    expect(instances.length).toBe(2);
    expect(instances[1].url).toBe('ws://localhost:1234');
  });

  it('closes socket on error', () => {
    render(<RoomsWebSocketListener />);

    const socket = instances[0];
    socket.trigger('error', new Error('Boom'));

    expect(socket.close).toHaveBeenCalled();
  });
});
