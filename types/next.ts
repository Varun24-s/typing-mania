// types/next.ts
import { Server as IOServer } from "socket.io";
import { NextApiResponse } from "next";
import { Socket as NetSocket } from "net";
import { Server as HTTPServer } from "http";

// Extend the default response to include a Socket.IO server instance
export type NextApiResponseServerIO = NextApiResponse & {
  socket: NetSocket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};
