"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JoinPage() {
  const router = useRouter()
  const [roomId, setRoomId] = useState("")
  const [username, setUsername] = useState("")

  const handleJoin = () => {
    if (roomId.trim() && username.trim()) {
      router.push(`/room/${roomId}?username=${encodeURIComponent(username)}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#2b4031] text-white p-4">
      <h1 className="text-3xl font-bold mb-6">Join Typing Race Room</h1>

      <input
        type="text"
        placeholder="Enter your name"
        className="text-black p-2 mb-4 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Room ID"
        className="text-black p-2 mb-4 rounded"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button
        onClick={handleJoin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Join Room
      </button>
    </div>
  )
}
