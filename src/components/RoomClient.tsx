"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { socket } from "@/lib/socket";
import { io } from "socket.io-client";
import TypingRace from "./TypingRace";
import { generateText } from "@/utils/generateText";
import Link from "next/link";

interface RoomClientProps {
  roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
  const searchParams = useSearchParams();
  const isHost = searchParams?.get("host") === "true";
  const initialUsername = searchParams?.get("username") || "";

  const [username, setUsername] = useState(initialUsername);
  const [nameInput, setNameInput] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [sharedText, setSharedText] = useState("");
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch("/api/socket").catch(() => {});
  }, []);

  useEffect(() => {
    if (username && !hasJoined) {
      socket.emit("join-room", { roomId, username });
      setHasJoined(true);
    }
  }, [username, hasJoined, roomId]);

  useEffect(() => {
    const handleUpdatePlayers = (updatedPlayers: string[]) => {
      setPlayers(updatedPlayers);
    };

    const handleRaceStarted = (data?: { text?: string }) => {
      if (data?.text) {
        setSharedText(data.text);
      }
      setRaceStarted(true);
    };

    socket.on("update-players", handleUpdatePlayers);
    socket.on("race-started", handleRaceStarted);

    return () => {
      socket.off("update-players", handleUpdatePlayers);
      socket.off("race-started", handleRaceStarted);
    };
  }, []);

  const handleStartRace = () => {
    const raceText = generateText();
    setSharedText(raceText);
    socket.emit("start-race", { roomId, text: raceText });
  };

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // ignore
    }
  };

  const copyInviteLink = async () => {
    try {
      const url = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setUsername(nameInput.trim());
  };

  const addTestBot = (customName?: string) => {
    const BOT_NAMES = ["Nitro", "GhostRacer", "Apex", "Dash", "Turbo", "Viper"];
    const unusedNames = BOT_NAMES.filter((n) => !players.includes(n));
    const botName = customName || unusedNames[0] || `Bot-${Math.floor(Math.random() * 1000)}`;

    const botSocket = io({ path: "/api/socket" });
    botSocket.emit("join-room", { roomId, username: botName });

    botSocket.on("race-started", ({ text }) => {
      const speedWpm = 68 + Math.floor(Math.random() * 26);
      const totalChars = (text || "The quick brown fox jumps over the lazy dog in a typing battle").length;
      let typed = 0;
      const charsPerSec = (speedWpm * 5) / 60;

      const interval = setInterval(() => {
        typed += charsPerSec * 0.5;
        const progress = Math.min(100, Math.round((typed / totalChars) * 100));

        botSocket.emit("player-progress", {
          roomId,
          username: botName,
          progress,
          wpm: speedWpm,
        });

        if (progress >= 100) {
          clearInterval(interval);
          botSocket.emit("typing-finished", {
            roomId,
            result: {
              username: botName,
              wpm: speedWpm,
              accuracy: 96 + Math.floor(Math.random() * 4),
              finished: true,
              progress: 100,
            },
          });
        }
      }, 500);
    });
  };

  const addMultipleBots = (count = 3) => {
    const BOT_NAMES = ["Nitro", "GhostRacer", "Apex", "Dash"];
    const available = BOT_NAMES.filter((n) => !players.includes(n)).slice(0, count);
    available.forEach((name, idx) => {
      setTimeout(() => addTestBot(name), idx * 100);
    });
  };

  if (raceStarted) {
    return (
      <TypingRace
        socket={socket}
        roomId={roomId}
        username={username}
        players={players}
        initialText={sharedText}
        isHost={isHost}
      />
    );
  }

  // Name input if joined via direct link without username
  if (!username) {
    return (
      <div className="max-w-md mx-auto py-16">
        <div className="panel p-6 sm:p-8 bg-white border border-[#E3E0D8]">
          <span className="text-[11px] font-mono-code uppercase tracking-wider text-[#77756F] block mb-1">
            Room Code: {roomId}
          </span>
          <h2 className="text-xl font-bold text-[#191919] mb-4">Enter your racer name</h2>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                autoFocus
                required
                maxLength={24}
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Racer handle"
                className="w-full px-3.5 py-2.5 rounded-sm bg-[#F6F4EF] border border-[#E3E0D8] text-[#191919] text-sm font-medium focus:bg-white focus:border-[#191919]"
              />
            </div>
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="btn-primary w-full py-2.5 text-sm cursor-pointer disabled:opacity-40"
            >
              Enter Lobby
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Lobby Pre-race Control Surface */}
      <div className="panel p-6 sm:p-8 bg-white border border-[#E3E0D8]">
        {/* Top Meta Bar */}
        <div className="border-b border-[#E3E0D8] pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono-code uppercase tracking-wider text-[#77756F] block mb-1">
              Pre-Race Control Room
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono-code text-xl sm:text-2xl font-bold text-[#191919]">
                {roomId}
              </span>
              <button
                onClick={copyRoomId}
                className="btn-ghost text-xs px-2 py-1 font-mono-code border border-[#E3E0D8] hover:border-[#191919]"
                title="Copy Room ID"
              >
                {copiedId ? "Copied" : "Copy Code"}
              </button>
              <button
                onClick={copyInviteLink}
                className="btn-ghost text-xs px-2 py-1 font-mono-code border border-[#E3E0D8] hover:border-[#191919]"
                title="Copy Link"
              >
                {copiedLink ? "Link Copied" : "Copy Link"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-code text-[#77756F]">
            <span className="w-2 h-2 rounded-full bg-[#FF4B35]" />
            <span>{players.length} {players.length === 1 ? "player" : "players"} connected</span>
          </div>
        </div>

        {/* Players List */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-mono-code text-[#77756F] uppercase mb-2">
            <div className="flex items-center gap-3">
              <span>Roster</span>
              {isHost && (
                <div className="flex items-center gap-2 lowercase text-[11px]">
                  <button
                    type="button"
                    onClick={() => addMultipleBots(3)}
                    className="text-[#77756F] hover:text-[#191919] underline decoration-[#E3E0D8] hover:decoration-[#191919] cursor-pointer"
                  >
                    + add 3 bots
                  </button>
                  <span className="text-[#E3E0D8]">|</span>
                  <button
                    type="button"
                    onClick={() => addTestBot()}
                    className="text-[#77756F] hover:text-[#191919] underline decoration-[#E3E0D8] hover:decoration-[#191919] cursor-pointer"
                  >
                    + add bot
                  </button>
                </div>
              )}
            </div>
            <span>Status</span>
          </div>

          <div className="divide-y divide-[#E3E0D8] border border-[#E3E0D8] rounded-sm bg-[#F6F4EF]/40">
            {players.map((name, i) => {
              const isCurrentUser = name === username;
              const isFirst = i === 0;

              return (
                <div
                  key={name}
                  className="px-4 py-3 flex items-center justify-between text-xs font-mono-code"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[#A3A097]">0{i + 1}</span>
                    <span className="font-sans text-sm font-medium text-[#191919]">
                      {name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] text-[#77756F] border border-[#E3E0D8] px-1 py-0.2 rounded-xs">
                        You
                      </span>
                    )}
                    {isFirst && (
                      <span className="text-[10px] bg-[#191919] text-white px-1.5 py-0.2 rounded-xs uppercase">
                        Host
                      </span>
                    )}
                  </div>

                  <span className="text-[#2E7D32] font-medium text-[11px]">
                    Ready
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E3E0D8]">
          <Link
            href="/"
            className="text-xs font-mono-code text-[#77756F] hover:text-[#191919] transition-colors"
          >
            &larr; Leave Room
          </Link>

          {isHost ? (
            <button
              onClick={handleStartRace}
              className="btn-accent text-sm py-2 px-6 font-medium cursor-pointer"
            >
              Start Race &rarr;
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#77756F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#191919] animate-pulse" />
              <span>Waiting for host to launch race...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
