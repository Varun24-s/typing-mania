"use client";

import { generateText } from "@/utils/generateText";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const DURATIONS = [15, 30, 60] as const;

export default function TypingTest() {
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isFocused, setIsFocused] = useState(true);

  const [stats, setStats] = useState({
    correctChars: 0,
    incorrectChars: 0,
    totalWords: 0,
    elapsedSeconds: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const initNewText = useCallback(() => {
    setText(generateText());
  }, []);

  useEffect(() => {
    initNewText();
  }, [initNewText]);

  const finishTest = useCallback((input: string, remainingTime: number) => {
    const trimmed = input.trim();
    const wordsTyped = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
    const typedText = text.slice(0, input.length);

    let correct = 0;
    let incorrect = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === typedText[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    const acc = input.length > 0 ? Math.round((correct / input.length) * 100) : 100;
    const elapsed = Math.max(1, selectedDuration - remainingTime);
    const minutes = elapsed / 60;
    const calculatedWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;

    setWpm(calculatedWpm);
    setAccuracy(acc);
    setStats({
      correctChars: correct,
      incorrectChars: incorrect,
      totalWords: wordsTyped,
      elapsedSeconds: elapsed,
    });
    setIsFinished(true);
  }, [text, selectedDuration]);

  // Timer countdown
  useEffect(() => {
    if (started && !isFinished && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (started && !isFinished && timeLeft === 0) {
      finishTest(userInput, 0);
    }
  }, [started, isFinished, timeLeft, userInput, finishTest]);

  // Live real-time WPM calculation while typing
  useEffect(() => {
    if (started && !isFinished && userInput.length > 0) {
      const elapsed = Math.max(1, selectedDuration - timeLeft);
      const minutes = elapsed / 60;
      const words = userInput.trim().split(/\s+/).filter(Boolean).length;
      const liveWpm = minutes > 0 ? Math.round(words / minutes) : 0;
      setWpm(liveWpm);

      const typedText = text.slice(0, userInput.length);
      const correct = userInput.split("").filter((c, i) => c === typedText[i]).length;
      setAccuracy(Math.round((correct / userInput.length) * 100));
    }
  }, [userInput, timeLeft, started, isFinished, selectedDuration, text]);

  const restart = useCallback((newDuration?: number) => {
    const dur = newDuration ?? selectedDuration;
    setSelectedDuration(dur);
    initNewText();
    setUserInput("");
    setTimeLeft(dur);
    setStarted(false);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    setTimeout(() => {
      inputRef.current?.focus();
      setIsFocused(true);
    }, 50);
  }, [selectedDuration, initNewText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;
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

    if (text.length > 0 && nextInput.length >= text.length) {
      finishTest(nextInput, timeLeft);
    }
  };

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restart();
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [restart]);

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6">
      {isFinished ? (
        /* Results View */
        <div className="panel p-6 sm:p-10 bg-white border border-[#E3E0D8]">
          <div className="border-b border-[#E3E0D8] pb-6 mb-8 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono-code uppercase tracking-widest text-[#77756F] block mb-1">
                Solo Performance
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#191919]">
                Session Complete
              </h2>
            </div>
            <div className="text-right font-mono-code text-xs text-[#77756F]">
              DURATION: <span className="text-[#191919] font-medium">{selectedDuration}s</span>
            </div>
          </div>

          {/* Primary Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#E3E0D8] pb-8 mb-8">
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
                Characters
              </span>
              <div className="text-4xl sm:text-5xl font-mono-code font-bold text-[#191919] tracking-tight">
                {stats.correctChars}
                <span className="text-xs font-normal text-[#FF4B35] ml-1">
                  {stats.incorrectChars > 0 ? `(-${stats.incorrectChars})` : ""}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono-code uppercase text-[#77756F] block mb-1">
                Elapsed
              </span>
              <div className="text-4xl sm:text-5xl font-mono-code font-bold text-[#191919] tracking-tight">
                {stats.elapsedSeconds}
                <span className="text-xs font-normal text-[#77756F] ml-1">s</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/"
              className="btn-secondary text-xs"
            >
              &larr; Return to Menu
            </Link>

            <button
              onClick={() => restart()}
              className="btn-primary text-xs"
            >
              Try Again (Esc)
            </button>
          </div>
        </div>
      ) : (
        /* Active Solo Practice Screen */
        <div className="space-y-6">
          {/* Header Controls: Duration selector + Timer */}
          <div className="flex items-center justify-between border-b border-[#E3E0D8] pb-3 text-xs font-mono-code">
            <div className="flex items-center gap-1.5">
              <span className="text-[#77756F] mr-1 uppercase">Duration:</span>
              {DURATIONS.map((dur) => (
                <button
                  key={dur}
                  disabled={started}
                  onClick={() => restart(dur)}
                  className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                    selectedDuration === dur
                      ? "bg-[#191919] text-white font-medium"
                      : "text-[#77756F] hover:text-[#191919] hover:bg-[#EFECE5]"
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>

            {/* Time Countdown */}
            <div>
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

          {/* Typing Passage (Visual Centerpiece) */}
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
                let charStyle = "text-[#B5B2A9]";
                if (i < userInput.length) {
                  charStyle =
                    char === userInput[i]
                      ? "text-[#191919] font-medium"
                      : "text-[#FF4B35] bg-[#FFF0EE] rounded-xs underline decoration-[#FF4B35]";
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

          {/* Live Telemetry HUD */}
          <div className="flex items-center justify-between border-t border-[#E3E0D8] pt-3 text-xs font-mono-code text-[#77756F] px-1">
            <div className="flex items-center gap-6">
              <span>
                SPEED: <strong className="text-[#191919] font-semibold">{wpm} WPM</strong>
              </span>
              <span>
                ACCURACY: <strong className="text-[#191919] font-semibold">{accuracy}%</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => restart()}
                className="text-[#77756F] hover:text-[#191919] transition-colors"
              >
                Reset (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
