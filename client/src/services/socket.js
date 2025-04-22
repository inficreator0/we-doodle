import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket = io(SOCKET_URL);

// Add event listeners for connection status
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

export default socket; 