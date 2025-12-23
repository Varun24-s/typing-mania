"use client"

import { useEffect, useRef, useState } from "react"
import { generateText } from "@/utils/generateText"
import { Socket } from "socket.io-client"
import { useRouter } from "next/navigation"
import { IoPeopleSharp } from "react-icons/io5";
import { LuAlarmClock } from "react-icons/lu";

interface TypingRaceProps {
  socket: Socket
  roomId: string
  username: string
  players: string[]
}

interface Opponent {
  username: string
  wpm: number
  accuracy: number
  finished: boolean
}

const TypingRace = ({ socket, roomId, username, players }: TypingRaceProps) => {
  const router = useRouter()
  const [text, setText] = useState("")
  const [userInput, setUserInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(3)
  const [started, setStarted] = useState(false)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [opponents, setOpponents] = useState<Record<string, Opponent>>({})
  const [showResults, setShowResults] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(generateText())
  }, [])

  useEffect(() => {
    if (started && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
      return () => clearInterval(interval)
    } else if (timeLeft === 0 && started) {
      calculateResult()
      setShowResults(true)
      socket.emit("typing-finished", {
        roomId,
        result: { username, wpm, accuracy, finished: true },
      })
    }
  }, [started, timeLeft])

  useEffect(() => {
    socket.on("user-joined", ({ username }) => {
      console.log(`${username} joined`)
    })

    socket.on("user-finished", (result: Opponent) => {
      setOpponents(prev => ({ ...prev, [result.username]: result }))
    })

    return () => {
      socket.off("user-joined")
      socket.off("user-finished")
    }
  }, [])

  useEffect(() => {
    const initialOpponents: Record<string, Opponent> = {};

    players.forEach(name => {
      if (name !== username) {
        initialOpponents[name] = {
          username: name,
          wpm: 0,
          accuracy: 100,
          finished: false,
        };
      }
    });

    setOpponents(initialOpponents);
  }, [players]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!started) setStarted(true)

    setUserInput(prev => {
      let newInput = prev
      if (e.key.length === 1) {
        newInput += e.key
      } else if (e.key === "Backspace") {
        newInput = prev.slice(0, -1)
      } else {
        return prev
      }
      return newInput
    })
  }

  const calculateResult = () => {
    const wordsTyped = userInput.trim().split(/\s+/).length
    const typedText = text.slice(0, userInput.length)
    const correctChars = userInput
      .split("")
      .filter((c, i) => c === typedText[i]).length

    const acc = userInput.length > 0
      ? Math.round((correctChars / userInput.length) * 100)
      : 0

    const minutes = (60 - timeLeft) / 60
    const calcWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0

    setWpm(calcWpm)
    setAccuracy(acc)
  }

  const restartRace = () => {
    setText(generateText())
    setUserInput("")
    setTimeLeft(60)
    setStarted(false)
    setWpm(0)
    setAccuracy(100)
    setShowResults(false)
    inputRef.current?.focus()
  }

  const goHome = () => {
    router.push("/")
  }

  const renderResultBoard = () => {
    const allPlayers = [
      { username, wpm, accuracy },
      ...Object.values(opponents),
    ]

    const ranked = allPlayers
      .filter(p => p.username)
      .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy)

    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">🏁 Final Results</h2>
        <table className="mx-auto text-left border border-gray-500">
          <thead>
            <tr className="bg-green-700 text-white">
              <th className="px-4 py-2">Rank</th>
              <th className="px-4 py-2">Player</th>
              <th className="px-4 py-2">WPM</th>
              <th className="px-4 py-2">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => (
              <tr key={i} className="bg-[#1f2d23] text-white border-t">
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{p.username}</td>
                <td className="px-4 py-2">{p.wpm}</td>
                <td className="px-4 py-2">{p.accuracy}%</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={restartRace}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
          >
            🔁 Restart Race
          </button>
          <button
            onClick={goHome}
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#2b4031] text-white p-6">
        {renderResultBoard()}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex text-white">

      {/* LEFT: Typing Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-10">
        <div className="text-3xl font-bold mb-10">
          Typing Race Room: {roomId}
        </div>

        <div
          className="text-xl font-mono border p-6 rounded-lg w-full max-w-2xl mb-6 border-blue-400 cursor-text min-h-[150px]"
          onClick={() => inputRef.current?.focus()}
        >
          {text.split("").map((char, i) => {
            let className = ""
            if (i < userInput.length) {
              className =
                char === userInput[i]
                  ? "text-blue-400"
                  : "text-red-500"
            }

            const isCursor = i === userInput.length

            return (
              <span
                key={i}
                className={`${className} ${isCursor ? "bg-white text-black animate-pulse" : ""
                  }`}
              >
                {char}
              </span>
            )
          })}
        </div>

        <input
          ref={inputRef}
          onKeyDown={handleKeyDown}
          className="opacity-0 absolute pointer-events-none"
          autoFocus
        />

        <p className="text-xl mt-4 flex items-center gap-2"><LuAlarmClock />Time Left: {timeLeft}s</p>
      </div>

      {/* RIGHT: Opponents Sidebar */}
      <aside className="w-[280px] border-l border-gray-700 p-6 ">
        <h3 className="text-2xl flex items-center gap-3 font-semibold mb-6">
          <IoPeopleSharp />
          Opponents
        </h3>

        <ul className="space-y-4">
          {Object.keys(opponents)
            .filter(name => name !== username)
            .map(name => (
              <li
                key={name}
                className="flex items-center gap-3 text-lg"
              >
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span>{name}</span>
              </li>
            ))}
        </ul>
      </aside>

    </div>
  )

}

export default TypingRace
