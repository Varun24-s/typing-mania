"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import io from "socket.io-client";
import TypingRace from "./TypingRace";
import { IoMdPerson } from "react-icons/io";

const socket = io({
  path: "/api/socket",
});

interface RoomClientProps {
  roomId: string;
}

export default function RoomClient({ roomId }: RoomClientProps) {
  const searchParams = useSearchParams();
  const isHost = searchParams?.get("host") === "true";
  const initialUsername = searchParams?.get("username") || "";

  const [username, setUsername] = useState(initialUsername);
  const [hasJoined, setHasJoined] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [raceStarted, setRaceStarted] = useState(false);

  useEffect(() => {
    fetch("/api/socket"); // Ensure socket server starts
  }, []);

  useEffect(() => {
    if (username && !hasJoined) {
      socket.emit("join-room", { roomId, username });
      setHasJoined(true);
    }
  }, [username, hasJoined, roomId]);

  useEffect(() => {
    socket.on("update-players", (updatedPlayers: string[]) => {
      setPlayers(updatedPlayers);
    });

    socket.on("race-started", () => {
      setRaceStarted(true);
    });

    return () => {
      socket.off("update-players");
      socket.off("race-started");
    };
  }, []);

  const handleStartRace = () => {
    socket.emit("start-race", roomId);
  };

  if (raceStarted) {
    return <TypingRace socket={socket} roomId={roomId} username={username} players={players}/>;
  }

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#2b4031] text-white p-6">
        <h1 className="text-3xl font-bold mb-4">Enter your name to join Room</h1>
        <input
          type="text"
          placeholder="Enter your name"
          onChange={(e) => setUsername(e.target.value.trim())}
          className="text-black p-2 mb-4 rounded"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-2">Room ID: <span className="text-blue-400">{roomId}</span></h1>
      {isHost ? <h2 className="text-xl my-4">Waiting for players...</h2> 
              : <h2 className="text-xl my-4">Waiting for host to start...</h2>
      } 
      <h3 className="text-2xl font-semibold mb-4">Players in Room:</h3>
      <ul className="mb-6">
        {players.map((name, i) => (
          <li key={i} className="text-2xl flex items-center gap-4"><IoMdPerson/>{name === username ? (
            <span className="text-blue-400">{name} (You)</span>
          ) : (
            <span>{name}</span>
          )}</li>
        ))}
      </ul>

      {isHost && (
        <button
          onClick={handleStartRace}
          className="mybutton z-5"
        >
          Start Race
        </button>
      )}
    </div>
  );
}
