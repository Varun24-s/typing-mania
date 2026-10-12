"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import Link from "next/link";

export default function JoinPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanRoom = roomId.trim();
    if (!cleanRoom || !cleanUser) return;

    setIsSubmitting(true);
    setError("");

    socket.emit("check-room", { roomId: cleanRoom }, (exists: boolean) => {
      if (!exists) {
        setError("Room not found. Check the code and try again.");
        setIsSubmitting(false);
        return;
      }

      socket.emit("join-room", {
        roomId: cleanRoom,
        username: cleanUser,
      });

      router.push(`/room/${cleanRoom}?username=${encodeURIComponent(cleanUser)}`);
    });
  };

  return (
    <div className="max-w-md mx-auto py-12 sm:py-20">
      <div className="mb-4">
        <Link
          href="/"
          className="text-xs font-mono-code text-[#77756F] hover:text-[#191919] transition-colors"
        >
          &larr; Return to Menu
        </Link>
      </div>

      <div className="panel p-6 sm:p-8 bg-white border border-[#E3E0D8]">
        <span className="text-[11px] font-mono-code uppercase tracking-wider text-[#77756F] block mb-1">
          Direct Connect
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-[#191919] mb-6">
          Join Race Room
        </h1>

        {error && (
          <div className="mb-5 p-3 rounded-sm bg-[#FFF0EE] border border-[#FFD5CF] text-[#FF4B35] text-xs font-mono-code">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#77756F] mb-1.5 uppercase font-mono-code tracking-wider">
              Racer Handle
            </label>
            <input
              type="text"
              required
              autoFocus
              maxLength={24}
              placeholder="Enter your name"
              className="w-full px-3.5 py-2.5 rounded-sm bg-[#F6F4EF] border border-[#E3E0D8] text-[#191919] placeholder-[#A3A097] text-sm font-medium focus:bg-white focus:border-[#191919] transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#77756F] mb-1.5 uppercase font-mono-code tracking-wider">
              Room Code
            </label>
            <input
              type="text"
              required
              placeholder="Paste room code"
              className="w-full px-3.5 py-2.5 rounded-sm bg-[#F6F4EF] border border-[#E3E0D8] text-[#191919] placeholder-[#A3A097] text-sm font-mono-code focus:bg-white focus:border-[#191919] transition-colors"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !username.trim() || !roomId.trim()}
            className="btn-primary w-full py-2.5 text-sm cursor-pointer disabled:opacity-40"
          >
            {isSubmitting ? "Connecting..." : "Join Race"}
          </button>
        </form>
      </div>
    </div>
  );
}
