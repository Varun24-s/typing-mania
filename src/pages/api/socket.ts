import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "../../../types/next";

const rooms = new Set<string>();

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    console.log("New Socket.IO server...");
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id);

      // ✅ CREATE ROOM (HOST)
      socket.on("create-room", ({ roomId, username }) => {
        rooms.add(roomId);
        socket.data.username = username;
        socket.data.roomId = roomId;
        socket.join(roomId);

        io.to(roomId).emit("update-players", [username]);
        console.log("Room created:", roomId, "by", username);
      });

      // ✅ CHECK ROOM (JOIN VALIDATION)
      socket.on("check-room", ({ roomId }, callback) => {
        if (typeof callback === "function") {
          callback(rooms.has(roomId));
        }
      });

      // ✅ JOIN ROOM (ONLY IF EXISTS)
      socket.on("join-room", ({ roomId, username }) => {
        if (!rooms.has(roomId)) {
          socket.emit("room-error", "Room does not exist");
          return;
        }

        socket.data.username = username;
        socket.data.roomId = roomId;
        socket.join(roomId);

        const socketsInRoom = Array.from(
          io.sockets.adapter.rooms.get(roomId) || []
        );

        const usernames = socketsInRoom
          .map((id) => io.sockets.sockets.get(id)?.data.username)
          .filter(Boolean);

        io.to(roomId).emit("update-players", usernames);
      });

      // ✅ START RACE (Broadcast to all players in room with shared text)
      socket.on("start-race", (payload: string | { roomId: string; text?: string }) => {
        const roomId = typeof payload === "string" ? payload : payload.roomId;
        const text = typeof payload === "object" ? payload.text : undefined;
        io.to(roomId).emit("race-started", { text });
      });

      // ✅ LIVE RACER PROGRESS (Broadcast live position on track)
      socket.on("player-progress", ({ roomId, username, progress, wpm }) => {
        socket.to(roomId).emit("opponent-progress", { username, progress, wpm });
      });

      // ✅ RESTART / REMATCH (Host triggers new race in same room)
      socket.on("rematch-race", ({ roomId, text }) => {
        io.to(roomId).emit("race-started", { text });
      });

      // ✅ TYPING FINISHED
      socket.on("typing-finished", ({ roomId, result }) => {
        socket.to(roomId).emit("user-finished", result);
      });

      // ✅ DISCONNECT & CLEANUP
      socket.on("disconnect", () => {
        const roomId = socket.data.roomId;
        console.log("User disconnected:", socket.data.username || socket.id);

        if (roomId) {
          const socketsInRoom = Array.from(
            io.sockets.adapter.rooms.get(roomId) || []
          );

          const usernames = socketsInRoom
            .map((id) => io.sockets.sockets.get(id)?.data.username)
            .filter(Boolean);

          io.to(roomId).emit("update-players", usernames);

          if (socketsInRoom.length === 0) {
            rooms.delete(roomId);
            console.log("Room deleted (empty):", roomId);
          }
        }
      });
    });

  }

  res.end();
}
