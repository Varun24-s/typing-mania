"use client"
import TypingTest from "@/components/TypingTest"
import { useRouter } from "next/navigation"
import { FaLongArrowAltLeft } from "react-icons/fa";

export default function TypingTestPage() {
  const router = useRouter();
  return (
    <div className="relative">
      <button onClick={() => router.push("/")} className={`fixed cursor-pointer flex items-center gap-4 top-4 left-4 z-[9999] text-3xl text-white`}>
        <FaLongArrowAltLeft/>Back to Home
      </button>
      <TypingTest />;

    </div>
  )
}
