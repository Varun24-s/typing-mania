"use client";

import TypingTest from "@/components/TypingTest";
import Link from "next/link";

export default function TypingTestPage() {
  return (
    <div className="py-2">
      <div className="mb-4">
        <Link
          href="/"
          className="text-xs font-mono-code text-[#77756F] hover:text-[#191919] transition-colors"
        >
          &larr; Return to Menu
        </Link>
      </div>
      <TypingTest />
    </div>
  );
}
