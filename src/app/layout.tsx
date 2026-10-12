/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Typing Race — Fast, Minimalist Multiplayer Typing",
  description: "A typography-led, competitive multiplayer typing race. Accurate WPM, real-time track telemetry, and clean design.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-[#F6F4EF] text-[#191919] min-h-screen flex flex-col antialiased selection:bg-[#FF4B35]/20 selection:text-[#191919]">
        {/* Compact, understated header */}
        <header className="border-b border-[#E3E0D8] bg-[#F6F4EF]/95 sticky top-0 z-40 backdrop-blur-xs">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
            {/* Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[#191919] hover:opacity-80 transition-opacity"
            >
              <span className="w-2 h-2 rounded-full bg-[#FF4B35]" />
              <span className="font-mono-code font-bold uppercase tracking-wider text-xs">
                typing<span className="text-[#77756F]">/</span>race
              </span>
            </Link>

            {/* Essential Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium">
              <Link
                href="/TypingTest"
                className="px-2.5 py-1 text-[#77756F] hover:text-[#191919] transition-colors rounded hover:bg-[#EFECE5]"
              >
                Solo Practice
              </Link>
              <span className="text-[#E3E0D8]">/</span>
              <Link
                href="/"
                className="px-2.5 py-1 text-[#77756F] hover:text-[#191919] transition-colors rounded hover:bg-[#EFECE5]"
              >
                Race Rooms
              </Link>
            </nav>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-[#E3E0D8] py-4 text-center text-[11px] text-[#A3A097] font-mono-code">
          <span>Less interface. More race.</span>
        </footer>
      </body>
    </html>
  );
}
