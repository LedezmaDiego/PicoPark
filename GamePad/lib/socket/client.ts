import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(url: string) {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(url, {
    transports: ['websocket', 'polling'],
    timeout: 5000,
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
