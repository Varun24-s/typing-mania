import { io, Socket } from "socket.io-client";

// Create a single socket instance (singleton)
export const socket: Socket = io({
  path: "/api/socket",
  autoConnect: true,
});
