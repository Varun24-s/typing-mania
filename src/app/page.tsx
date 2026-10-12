"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import uniqid from "uniqid";
import { socket } from "@/lib/socket";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/socket").catch(() => {});

    const handleRoomError = (msg: string) => {
      setErrorMessage(msg || "Room does not exist.");
      setIsSubmitting(false);
    };

    socket.on("room-error", handleRoomError);
    return () => {
      socket.off("room-error", handleRoomError);
    };
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMessage("Enter your racer name to start.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    const roomId = uniqid();

    socket.emit("create-room", {
      roomId,
      username: cleanUser,
    });

    router.push(
      `/room/${roomId}?host=true&username=${encodeURIComponent(cleanUser)}`
    );
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim();
    const cleanRoom = roomIdInput.trim();

    if (!cleanUser) {
      setErrorMessage("Enter your racer name.");
      return;
    }
    if (!cleanRoom) {
      setErrorMessage("Enter the room code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    socket.emit("check-room", { roomId: cleanRoom }, (exists: boolean) => {
      if (!exists) {
        setErrorMessage("Room not found. Check the code and try again.");
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
    <div className="max-w-xl mx-auto py-12 sm:py-20">
      {/* Typographic Title Header */}
      <div className="mb-10 text-left">
        <span className="text-[11px] font-mono-code font-medium uppercase tracking-widest text-[#77756F] block mb-2">
          Competitive Typing
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#191919] leading-tight">
          Real-time typing races.
          <br />
          <span className="text-[#77756F] font-normal">Pure speed, zero clutter.</span>
        </h1>
      </div>

      {/* Main Entry Control Surface */}
      <div className="panel p-6 sm:p-8 bg-white border border-[#E3E0D8]">
        {/* Mode Selector Tabs */}
        <div className="flex items-center border-b border-[#E3E0D8] pb-3 mb-6 gap-6 text-xs font-mono-code uppercase tracking-wider">
          <button
            type="button"
            onClick={() => {
              setMode("create");
              setErrorMessage("");
            }}
            className={`pb-1 transition-colors relative cursor-pointer ${
              mode === "create"
                ? "text-[#191919] font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FF4B35]"
                : "text-[#77756F] hover:text-[#191919]"
            }`}
          >
            Create Room
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("join");
              setErrorMessage("");
            }}
            className={`pb-1 transition-colors relative cursor-pointer ${
              mode === "join"
                ? "text-[#191919] font-bold after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-[2px] after:bg-[#FF4B35]"
                : "text-[#77756F] hover:text-[#191919]"
            }`}
          >
            Join with Code
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3 rounded-sm bg-[#FFF0EE] border border-[#FFD5CF] text-[#FF4B35] text-xs font-mono-code">
            {errorMessage}
          </div>
        )}

        {mode === "create" ? (
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#77756F] mb-1.5 uppercase font-mono-code tracking-wider">
                Racer Handle
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength={24}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F6F4EF] border border-[#E3E0D8] text-[#191919] placeholder-[#A3A097] text-sm font-medium focus:bg-white focus:border-[#191919] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="btn-primary w-full py-2.5 text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Generating Lobby..." : "Create Race Room"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#77756F] mb-1.5 uppercase font-mono-code tracking-wider">
                Racer Handle
              </label>
              <input
                type="text"
                autoFocus
                required
                maxLength={24}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F6F4EF] border border-[#E3E0D8] text-[#191919] placeholder-[#A3A097] text-sm font-medium focus:bg-white focus:border-[#191919] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#77756F] mb-1.5 uppercase font-mono-code tracking-wider">
                Room Code
              </label>
              <input
                type="text"
                required
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Paste room ID"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F6F4EF] border border-[#E3E0D8] text-[#191919] placeholder-[#A3A097] text-sm font-mono-code focus:bg-white focus:border-[#191919] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !roomIdInput.trim()}
              className="btn-primary w-full py-2.5 text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Connecting..." : "Join Race"}
            </button>
          </form>
        )}
      </div>

      {/* Quieter Solo Practice Link */}
      <div className="mt-8 flex items-center justify-between text-xs font-mono-code text-[#77756F] px-1">
        <span>No opponents needed?</span>
        <Link
          href="/TypingTest"
          className="text-[#191919] hover:text-[#FF4B35] transition-colors font-medium underline underline-offset-4 decoration-[#E3E0D8] hover:decoration-[#FF4B35]"
        >
          Solo practice sprint &rarr;
        </Link>
      </div>
    </div>
  );
}
