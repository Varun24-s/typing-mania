"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { generateText } from "@/utils/generateText";
import { Socket } from "socket.io-client";
import { useRouter } from "next/navigation";

interface TypingRaceProps {
  socket: Socket;
  roomId: string;
  username: string;
  players: string[];
  initialText?: string;
  isHost?: boolean;
}

interface Opponent {
  username: string;
  wpm: number;
  accuracy: number;
  finished: boolean;
  progress: number;
}

const RACE_DURATION = 60;

export default function TypingRace({
  socket,
  roomId,
  username,
  players,
  initialText,
  isHost = false,
}: TypingRaceProps) {
  const router = useRouter();
  const [text, setText] = useState(initialText || "");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(RACE_DURATION);
  const [started, setStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [opponents, setOpponents] = useState<Record<string, Opponent>>({});
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialText && text !== initialText) {
      setText(initialText);
    } else if (!text) {
      setText(initialText || generateText());
    }
  }, [initialText, text]);

  // Opponents state initialization - safely merge without resetting progress
  useEffect(() => {
    setOpponents((prev) => {
      const updated: Record<string, Opponent> = { ...prev };
      players.forEach((name) => {
        if (name !== username && !updated[name]) {
          updated[name] = {
            username: name,
            wpm: 0,
            accuracy: 100,
            finished: false,
            progress: 0,
          };
        }
      });
      return updated;
    });
  }, [players, username]);

  const calculateStats = useCallback(
    (input: string, remainingTime: number) => {
      const trimmed = input.trim();
      const wordsTyped = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
      const typedText = text.slice(0, input.length);
      const correctChars = input
        .split("")
        .filter((c, i) => c === typedText[i]).length;

      const acc =
        input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

      const elapsedSeconds = Math.max(1, RACE_DURATION - remainingTime);
      const elapsedMinutes = elapsedSeconds / 60;
      const calcWpm =
        elapsedMinutes > 0 ? Math.round(wordsTyped / elapsedMinutes) : 0;

      return { wpm: calcWpm, accuracy: acc, elapsedSeconds };
    },
    [text]
  );

  const finishRace = useCallback(
    (input: string, remainingTime: number) => {
      const stats = calculateStats(input, remainingTime);
      setWpm(stats.wpm);
      setAccuracy(stats.accuracy);
      setShowResults(true);

      socket.emit("typing-finished", {
        roomId,
        result: {
          username,
          wpm: stats.wpm,
          accuracy: stats.accuracy,
          finished: true,
          progress: 100,
        },
      });
    },
    [calculateStats, roomId, socket, username]
  );

  // Timer countdown
  useEffect(() => {
    if (started && !showResults && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(interval);
    } else if (started && !showResults && timeLeft === 0) {
      finishRace(userInput, 0);
    }
  }, [started, showResults, timeLeft, userInput, finishRace]);

  // Real-time socket event handling
  useEffect(() => {
    const handleOpponentProgress = ({
      username: opName,
      progress,
      wpm: opWpm,
    }: {
      username: string;
      progress: number;
      wpm: number;
    }) => {
      if (opName === username) return;

      setOpponents((prev) => {
        const current = prev[opName] || {
          username: opName,
          wpm: 0,
          accuracy: 100,
          finished: false,
          progress: 0,
        };
        return {
          ...prev,
          [opName]: {
            ...current,
            progress,
            wpm: opWpm,
          },
        };
      });
    };

    const handleUserFinished = (result: Opponent) => {
      if (result.username === username) return;

      setOpponents((prev) => ({
        ...prev,
        [result.username]: {
          ...(prev[result.username] || {
            username: result.username,
            wpm: result.wpm,
            accuracy: result.accuracy,
          }),
          ...result,
          finished: true,
          progress: 100,
        },
      }));
    };

    const handleRematchStarted = (data?: { text?: string }) => {
      setText(data?.text || generateText());
      setUserInput("");
      setTimeLeft(RACE_DURATION);
      setStarted(false);
      setWpm(0);
      setAccuracy(100);
      setShowResults(false);
      setOpponents((prev) => {
        const reset: Record<string, Opponent> = {};
        Object.keys(prev).forEach((name) => {
          reset[name] = {
            ...prev[name],
            wpm: 0,
            accuracy: 100,
            finished: false,
            progress: 0,
          };
        });
        return reset;
      });
      setTimeout(() => inputRef.current?.focus(), 50);
    };

    socket.on("opponent-progress", handleOpponentProgress);
    socket.on("user-finished", handleUserFinished);
    socket.on("race-started", handleRematchStarted);

    return () => {
      socket.off("opponent-progress", handleOpponentProgress);
      socket.off("user-finished", handleUserFinished);
      socket.off("race-started", handleRematchStarted);
    };
  }, [socket]);

  // Keystroke handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showResults) return;
    if (!started) setStarted(true);

    let nextInput = userInput;
    if (e.key.length === 1) {
      if (userInput.length < text.length) {
        nextInput = userInput + e.key;
      } else {
        return;
      }
    } else if (e.key === "Backspace") {
      nextInput = userInput.slice(0, -1);
    } else {
      return;
    }

    setUserInput(nextInput);

    const currentProgress =
      text.length > 0
        ? Math.min(100, Math.round((nextInput.length / text.length) * 100))
        : 0;

    const currentStats = calculateStats(nextInput, timeLeft);
    setWpm(currentStats.wpm);
    setAccuracy(currentStats.accuracy);

    // Broadcast live telemetry
    socket.emit("player-progress", {
      roomId,
      username,
      progress: currentProgress,
      wpm: currentStats.wpm,
    });

    if (text.length > 0 && nextInput.length >= text.length) {
      finishRace(nextInput, timeLeft);
    }
  };

  const handleRematch = () => {
    const newText = generateText();
    socket.emit("rematch-race", { roomId, text: newText });
  };

  const userProgress =
    text.length > 0
      ? Math.min(100, Math.round((userInput.length / text.length) * 100))
      : 0;

  // Build sorted standings (defensively filtering out user from opponents)
  const filteredOpponents = Object.values(opponents).filter(
    (op) => op.username && op.username !== username
  );

  const allRacers = [
    { username, wpm, accuracy, finished: showResults, progress: userProgress, isUser: true },
    ...filteredOpponents.map((op) => ({ ...op, isUser: false })),
  ].sort((a, b) => {
    if (b.finished !== a.finished) return b.finished ? 1 : -1;
    return b.wpm - a.wpm || b.accuracy - a.accuracy;
  });

  const userRankIndex = allRacers.findIndex((r) => r.isUser);
  const userRank = userRankIndex >= 0 ? userRankIndex + 1 : 1;

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6">
      {showResults ? (
        /* ================= RESULTS SCREEN (RESTRAINED & CONFIDENT) ================= */
        <div className="panel p-6 sm:p-10 bg-white border border-[#E3E0D8]">
          {/* Header & Placement */}
          <div className="border-b border-[#E3E0D8] pb-6 mb-8 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-widest text-[#77756F] block mb-1">
                Race Summary
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#191919]">
                Finished {userRank === 1 ? "1st" : userRank === 2 ? "2nd" : userRank === 3 ? "3rd" : `${userRank}th`}
                <span className="text-sm font-normal text-[#77756F] ml-3">
                  of {allRacers.length} racers
                </span>
              </h2>
            </div>
            <div className="text-right font-mono-code text-xs text-[#77756F]">
              ROOM: <span className="text-[#191919] font-medium">{roomId}</span>
            </div>
          </div>

          {/* Primary Metrics Strip */}
          <div className="grid grid-cols-3 gap-4 border-b border-[#E3E0D8] pb-8 mb-8">
            <div>
              <span className="text-xs font-mono-code uppercase text-[#77756F] block mb-1">
                Speed
              </span>
              <div className="text-4xl sm:text-5xl font-mono-code font-bold text-[#191919] tracking-tight">
                {wpm}
                <span className="text-xs font-normal text-[#77756F] ml-1">WPM</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono-code uppercase text-[#77756F] block mb-1">
                Accuracy
              </span>
              <div className="text-4xl sm:text-5xl font-mono-code font-bold text-[#191919] tracking-tight">
                {accuracy}
                <span className="text-xs font-normal text-[#77756F] ml-1">%</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono-code uppercase text-[#77756F] block mb-1">
                Time
              </span>
              <div className="text-4xl sm:text-5xl font-mono-code font-bold text-[#191919] tracking-tight">
                {RACE_DURATION - timeLeft}
                <span className="text-xs font-normal text-[#77756F] ml-1">s</span>
              </div>
            </div>
          </div>

          {/* Standings Table */}
          <div className="mb-8">
            <span className="text-xs font-mono-code uppercase text-[#77756F] block mb-3">
              Full Standings
            </span>
            <div className="border border-[#E3E0D8] rounded-sm overflow-hidden bg-white">
              <table className="w-full text-left text-xs font-mono-code">
                <thead className="bg-[#F6F4EF] border-b border-[#E3E0D8] text-[#77756F] uppercase">
                  <tr>
                    <th className="py-2.5 px-4 font-medium w-16">Rank</th>
                    <th className="py-2.5 px-4 font-medium">Racer</th>
                    <th className="py-2.5 px-4 font-medium text-right">WPM</th>
                    <th className="py-2.5 px-4 font-medium text-right">Accuracy</th>
                    <th className="py-2.5 px-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3E0D8]">
                  {allRacers.map((r, i) => (
                    <tr
                      key={r.username}
                      className={r.isUser ? "bg-[#FFF0EE]/50 font-medium text-[#191919]" : "text-[#77756F]"}
                    >
                      <td className="py-2.5 px-4">
                        {i + 1 === 1 ? (
                          <span className="text-[#FF4B35] font-bold">1st</span>
                        ) : (
                          `${i + 1}`
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-sm text-[#191919] font-medium">
                        {r.username}
                        {r.isUser && (
                          <span className="ml-2 text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded-sm bg-[#FF4B35] text-white">
                            You
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right text-[#191919] font-semibold">{r.wpm}</td>
                      <td className="py-2.5 px-4 text-right">{r.accuracy}%</td>
                      <td className="py-2.5 px-4 text-right">
                        {r.finished ? "Finished" : `${r.progress}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => router.push("/")}
              className="btn-secondary text-xs"
            >
              &larr; Return to Menu
            </button>

            {isHost && (
              <button
                onClick={handleRematch}
                className="btn-primary text-xs"
              >
                Race Again (Rematch)
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ================= ACTIVE RACE SCREEN (THE SIGNATURE SCREEN) ================= */
        <div className="space-y-6">
          {/* Hierarchy 1: Race status and room header */}
          <div className="flex items-center justify-between border-b border-[#E3E0D8] pb-3 text-xs font-mono-code">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#191919] font-medium uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#FF4B35]" />
                Live Race
              </span>
              <span className="text-[#E3E0D8]">|</span>
              <span className="text-[#77756F]">
                ROOM: <span className="text-[#191919] font-medium">{roomId}</span>
              </span>
            </div>

            {/* Time Remaining */}
            <div className="text-right">
              <span className="text-[#77756F] mr-1.5">TIME:</span>
              <span
                className={`font-semibold ${
                  timeLeft <= 10 ? "text-[#FF4B35]" : "text-[#191919]"
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Hierarchy 2: Competitor Progress (Restrained Horizontal Lanes) */}
          <div className="panel p-4 bg-white border border-[#E3E0D8] space-y-3">
            {/* Current Player Track */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono-code">
                <span className="font-semibold text-[#191919] flex items-center gap-1.5">
                  <span className="text-[#FF4B35]">&bull;</span>
                  {username} (You)
                </span>
                <span className="text-[#77756F]">
                  {wpm} WPM &middot; {userProgress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#EFECE5] rounded-xs overflow-hidden relative">
                <div
                  className="h-full bg-[#FF4B35] transition-all duration-150 ease-out"
                  style={{ width: `${userProgress}%` }}
                />
              </div>
            </div>

            {/* Opponent Tracks */}
            {Object.values(opponents)
              .filter((op) => op.username && op.username !== username)
              .map((op) => (
              <div key={op.username} className="space-y-1 pt-1 border-t border-[#EFECE5]">
                <div className="flex items-center justify-between text-xs font-mono-code text-[#77756F]">
                  <span>{op.username}</span>
                  <span>
                    {op.wpm || 0} WPM &middot; {op.progress || 0}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#EFECE5] rounded-xs overflow-hidden relative">
                  <div
                    className="h-full bg-[#77756F] transition-all duration-150 ease-out"
                    style={{ width: `${op.progress || 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Hierarchy 3: Typing passage and interaction (Visual centerpiece) */}
          <div
            onClick={() => {
              inputRef.current?.focus();
              setIsFocused(true);
            }}
            className={`panel p-6 sm:p-8 bg-white border cursor-text min-h-[220px] transition-colors relative ${
              isFocused ? "border-[#191919]" : "border-[#E3E0D8]"
            }`}
          >
            {!isFocused && (
              <div className="absolute top-2 right-3 text-[11px] font-mono-code text-[#77756F]">
                Click anywhere to focus
              </div>
            )}

            <div className="font-mono-code text-lg sm:text-xl leading-[1.85] select-none tracking-normal">
              {text.split("").map((char, i) => {
                let charStyle = "text-[#B5B2A9]"; // Upcoming
                if (i < userInput.length) {
                  charStyle =
                    char === userInput[i]
                      ? "text-[#191919] font-medium" // Correct
                      : "text-[#FF4B35] bg-[#FFF0EE] rounded-xs underline decoration-[#FF4B35]"; // Incorrect
                }
                const isCursor = i === userInput.length;

                return (
                  <span key={i} className={`relative ${charStyle}`}>
                    {isCursor && <span className="typing-caret" />}
                    {char}
                  </span>
                );
              })}
            </div>

            <input
              ref={inputRef}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="opacity-0 absolute pointer-events-none"
              autoFocus
            />
          </div>

          {/* Hierarchy 4: Live Telemetry HUD */}
          <div className="flex items-center justify-between border-t border-[#E3E0D8] pt-3 text-xs font-mono-code text-[#77756F] px-1">
            <div className="flex items-center gap-6">
              <span>
                SPEED: <strong className="text-[#191919] font-semibold">{wpm} WPM</strong>
              </span>
              <span>
                ACCURACY: <strong className="text-[#191919] font-semibold">{accuracy}%</strong>
              </span>
            </div>

            <div className="text-[11px]">
              {started ? "Race underway" : "Type first character to begin"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
