// pages/api/socket.ts
import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@../../../types/next";

const rooms = new Set<string>();

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log("New Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected");

      // ✅ CREATE ROOM (HOST)
      socket.on("create-room", ({ roomId, username }) => {
        rooms.add(roomId);
        socket.data.username = username;
        socket.join(roomId);

        io.to(roomId).emit("update-players", [username]);
        console.log("Room created:", roomId);
      });

      // ✅ CHECK ROOM (JOIN VALIDATION)
      socket.on("check-room", ({ roomId }, callback) => {
        callback(rooms.has(roomId));
      });

      // ✅ JOIN ROOM (ONLY IF EXISTS)
      socket.on("join-room", ({ roomId, username }) => {
        if (!rooms.has(roomId)) {
          socket.emit("room-error", "Room does not exist");
          return;
        }

        socket.data.username = username;
        socket.join(roomId);

        const socketsInRoom = Array.from(
          io.sockets.adapter.rooms.get(roomId) || []
        );

        const usernames = socketsInRoom
          .map((id) => io.sockets.sockets.get(id)?.data.username)
          .filter(Boolean);

        io.to(roomId).emit("update-players", usernames);
      });

      socket.on("start-race", (roomId) => {
        io.to(roomId).emit("race-started");
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
        // cleanup can be added later
      });
    });

  }

  res.end();
}
