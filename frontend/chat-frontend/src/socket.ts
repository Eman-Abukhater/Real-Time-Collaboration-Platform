import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (socket) socket.disconnect(); // Close old socket if exists

  socket = io("https://web-production-7432.up.railway.app", {
    path: "/socket.io",
    query: { userId },
  });
  

  return socket;
};

export const getSocket = () => socket;
