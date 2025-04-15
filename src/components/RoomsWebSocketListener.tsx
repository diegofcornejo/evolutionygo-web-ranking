import { addRoom, deleteRoom, listRooms, updateRoom } from '@stores/rooms/rooms-actions';
import { useEffect } from 'react';

export const RoomsWebSocketListener = () => {
  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;
    let reconnectTimeout: NodeJS.Timeout;

    const MAX_RECONNECT_ATTEMPTS = 10;
    const RECONNECT_INTERVAL = 3000;

    const connect = () => {
      console.log('Connecting to WebSocket...');
      socket = new WebSocket(`${import.meta.env.PUBLIC_WEBSOCKET_URL}`);

      socket.addEventListener('open', () => {
        console.log('✅ WebSocket connected');
        reconnectAttempts = 0;
      });

      socket.addEventListener('message', (event) => {
        const payload = JSON.parse(event.data);
        switch (payload.action) {
          case 'ADD-ROOM':
            addRoom(payload.data);
            break;
          case 'REMOVE-ROOM':
            deleteRoom(payload.data);
            break;
          case 'UPDATE-ROOM':
            updateRoom(payload.data);
            break;
          case 'GET-ROOMS':
            listRooms(payload.data);
            break;
        }
      });

      socket.addEventListener('close', () => {
        console.warn('⚠️ WebSocket disconnected');
        attemptReconnect();
      });

      socket.addEventListener('error', (err) => {
        console.error('❌ WebSocket error', err);
        socket?.close();
      });
    };

    const attemptReconnect = () => {
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        console.log(`🔁 Reconnecting in ${RECONNECT_INTERVAL / 1000}s... (attempt ${reconnectAttempts})`);
        reconnectTimeout = setTimeout(connect, RECONNECT_INTERVAL);
      } else {
        console.error('❌ Max reconnection attempts reached. Giving up.');
      }
    };

    connect();

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return null;
};
