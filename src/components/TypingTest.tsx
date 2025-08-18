"use client"

import { generateText } from "@/utils/generateText"
import localFont from "next/font/local"
import { useEffect, useRef, useState } from "react"
import { mysFont } from "@/app/fonts"



const TypingTest = () => {
    const [text, setText] = useState("")
    const [userInput, setUserInput] = useState("")
    const [wpm, setWpm] = useState(0)
    const [timeLeft, setTimeLeft] = useState(5)
    const [started, setStarted] = useState(false)
    const [accuracy, setAccuracy] = useState(100)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setText(generateText())
    }, [])

    useEffect(() => {
        if (started && timeLeft > 0) {
            const interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
            return () => clearInterval(interval)
        } else if (timeLeft === 0) {
            calculateResult()
        }
    }, [started, timeLeft])

     const calculateResult = () => {
        const wordsTyped = userInput.trim().split(" ").length
        const typedText = text.slice(0, userInput.length)
        const correctChars = userInput.split("").filter((c, i) => c === typedText[i]).length
        const acc = userInput.length > 0
            ? Math.round((correctChars / userInput.length) * 100)
            : 0

        const minutes = (60 - timeLeft) / 60
        const wpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0

        setWpm(wpm)
        setAccuracy(acc)
    }

    const restart = () => {
        setText(generateText())
        setUserInput("")
        setTimeLeft(60)
        setStarted(false)
        setWpm(0)
        setAccuracy(100)
        inputRef.current?.focus()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!started) setStarted(true)

        if (e.key.length === 1) {
            setUserInput((prev) => prev + e.key)
        } else if (e.key === "Backspace") {
            setUserInput((prev) => prev.slice(0, -1))
        }
    }


    return (
        <>
          {timeLeft === 0 ? (
            // ⏱ Result screen
            <div className="flex flex-col items-center mt-50 mr-15 min-h-screen bg-[#2b4031] text-[#F1F5F9] p-4 text-center z-5">
              <h1 className="text-5xl font-bold mb-6">⏱ Time's Up!</h1>
              <p className="text-3xl mb-2">⌨️ Words Per Minute (WPM): <span className="text-green-400">{wpm}</span></p>
              <p className="text-3xl mb-8">✅ Accuracy: <span className="text-green-400">{accuracy}%</span></p>
              <button
                onClick={restart}
                className="mybutton text-2xl z-5"
              >
                Try Again
              </button>
            </div>
          ) : (
            // ✍️ Typing screen
            <div
              className="flex flex-col items-center min-h-screen p-4 w-[80vw] bg-[#2b4031] text-[#F1F5F9]"
              onClick={() => inputRef.current?.focus()}
            >
              <div className="relative w-full max-w-3xl mx-auto mt-30 mb-8 z-5">
                <div className="text-6xl font-bold text-center">
                  {started ? "Typing..." : "Start Typing"}
                </div>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-3xl text-gray-300">
                  Time Left: {timeLeft}s
                </div>
              </div>
      
              <div
                className="text-xl font-mono bg-transparent px-8  py-6 border ml-44 w-[40vw] border-green-800 rounded-lg max-w-3xl min-h-[250px] cursor-text z-5"
                onClick={() => inputRef.current?.focus()}
              >
                {text.split("").map((char, i) => {
                  let className = ""
                  if (i < userInput.length) {
                    className = char === userInput[i] ? "text-green-400" : "text-red-500"
                  }
                  const isCursor = i === userInput.length
                  return (
                    <span key={i} className={`${className} ${isCursor ? "bg-white text-black animate-pulse" : ""}`}>
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
            
              <button
                onClick={restart}
                className="mybutton text-2xl mt-6 ml-40 z-5"
              >
                Restart
              </button>
            </div>
          )}
        </>
      )
      
}

export default TypingTest
