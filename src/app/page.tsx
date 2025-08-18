"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import uniqid from "uniqid";
import { TypewriterEffect } from "@/components/typewriter-effect";

export default function Home() {
  const router = useRouter();
  const [showHostModal, setShowHostModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hostUsername, setHostUsername] = useState("");
  const [joinUsername, setJoinUsername] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");

  const handleStart = () => {
    router.push("/TypingTest");
  };

  const handleCreateRoom = () => {
    setShowHostModal(true);
  };

  const handleJoin = () => {
    setShowJoinModal(true);
  };

  const handleSubmitHost = () => {
    if (!hostUsername.trim()) return;
    const roomId = uniqid();
    router.push(`/room/${roomId}?host=true&username=${encodeURIComponent(hostUsername)}`);
  };

  const handleSubmitJoin = () => {
    if (!joinUsername.trim() || !roomIdInput.trim()) return;
    router.push(`/room/${roomIdInput}?username=${encodeURIComponent(joinUsername)}`);
  };

  const words = [
    { text: "Typing" },
    { text: "Mania" }
  ];

  return (
    <div className={`flex relative flex-col items-center tracking-tighter h-screen text-center px-4 mr-20`}>
      <div className={`z-1 w-[40vw] ${showHostModal || showJoinModal ? "hidden" : "block"}`}>
        <div className={`text-6xl font-bold mb-4 mt-37 flex items-center justify-center gap-3`}>
          <span className="text-white">Welcome to</span>
          <TypewriterEffect words={words} />
        </div>

        <div className="tracking-tighter">
          <div className="mb-6 text-3xl mt-10 text-gray-300">
            Test your typing speed and accuracy in real-time.<br />Click the button below to begin.
          </div>
        </div>

        <button
          onClick={handleStart}
          className="mybutton text-2xl"
        >
          Start Typing Test
        </button>

        <div>
          <div className="mb-6 text-3xl mt-8 text-gray-300">
            Battle of Keyboards start here !!
          </div>
        </div>

        <div className="flex gap-7 mt-2 text-2xl items-center justify-center">
          <button onClick={handleCreateRoom} className="mybutton">Create Room</button>
          <button onClick={handleJoin} className="mybutton">Join Room</button>
        </div>
      </div>

      {/* Modal for Host Username */}
      {showHostModal && (
        <div className="fixed inset-0 flex mt-40 justify-center z-5 mr-20">
          <div className="text-white p-6 rounded-lg w-[40vw] ">
            <h2 className="text-5xl font-bold mb-4">Enter your name</h2>
            <input
              type="text"
              value={hostUsername}
              onChange={(e) => setHostUsername(e.target.value)}
              className="w-full border  border-gray-300 px-3 py-2 text-xl rounded mb-4"
              placeholder="Your name"
            />
            <div className="flex justify-end gap-5">
              <button onClick={() => setShowHostModal(false)} className="text-white text-2xl">
                Cancel
              </button>
              <button onClick={handleSubmitHost} className="mybutton text-2xl">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Join Room */}
      {showJoinModal && (
        <div className="fixed inset-0 flex mt-40 justify-center z-5 mr-20">
          <div className=" text-white p-6 rounded-lg w-[40vw]">
            <h2 className="text-5xl font-bold mb-4">Join Room</h2>
            <input
              type="text"
              value={joinUsername}
              onChange={(e) => setJoinUsername(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-xl rounded mb-4 "
              placeholder="Your name"
            />
            <input
              type="text"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-xl rounded mb-4 "
              placeholder="Enter Room ID"
            />
            <div className="flex justify-end gap-5">
              <button onClick={() => setShowJoinModal(false)} className="text-white text-2xl">Cancel</button>
              <button onClick={handleSubmitJoin} className="mybutton text-2xl">Join</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
