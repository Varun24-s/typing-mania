"use client"
import TypingTest from "@/components/TypingTest"
import { useRouter } from "next/navigation"

export default function TypingTestPage() {
  const router = useRouter();
  return (
    <div>
      <button onClick={() => router.push("/")} className={`absolute text-3xl text-white top-4 left-4 z-1`}>
        ← Back to Home
      </button>
      <TypingTest />;

    </div>
  )
}
