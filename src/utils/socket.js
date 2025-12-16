// src/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling']
});

// Événements de connexion
socket.on('connect', () => {
  console.log('✅ Socket connecté:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket déconnecté:', reason);
});

socket.on('connect_error', (error) => {
  console.error('🔴 Erreur de connexion socket:', error);
});

// Helper functions
export const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join', userId);
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};