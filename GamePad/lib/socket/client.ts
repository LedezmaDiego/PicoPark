import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectSocket(url: string) {
  socket = io(url, {
    transports: ['websocket', 'polling'], // 👈 IMPORTANTE
    timeout: 5000,
  });

  socket.on('connect', () => {
    console.log('✅ SOCKET CONNECTED:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.log('❌ CONNECT ERROR:', err.message);
  });

  socket.on('error', (err) => {
    console.log('❌ SOCKET ERROR:', err);
  });

  socket.on('disconnect', () => {
    console.log('🔌 DISCONNECTED');
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
