import { io, Socket } from 'socket.io-client';
import { DrawingData } from '../types';

const SOCKET_URL = 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export const connectSocket = (): void => {
  if (!socket.connected) {
    console.log('Manually connecting socket...');
    socket.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export const emitDraw = (data: DrawingData): void => {
  socket.emit('draw', data);
};

export const emitClearCanvas = (): void => {
  socket.emit('clear-canvas');
};

export const emitColorChange = (color: string): void => {
  socket.emit('color-change', { color });
};

export const emitJoinBoard = (username: string, boardName: string): void => {
  console.log('Emitting user-join:', { username, boardName });
  socket.emit('user-join', { username, boardName });
};

export const emitJoinRoom = (boardName: string): void => {
  console.log('Emitting join-board:', boardName);
  socket.emit('join-board', boardName);
}; 