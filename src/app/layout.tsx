import "./globals.css"
import { ReactNode } from "react"
import localFont from "next/font/local"

export const myFont = localFont({
  src: './fonts/ByteBounce.ttf',
  display: "swap",
})

export const metadata = {
  title: "Typing Mania",
  description: "Test your typing speed and accuracy in real time.",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className={`${myFont.className} relative`}>
      <body className="bg-[#2b4031] overflow-hidden ">
      {/* <img src="front-view-of-vintage-beige-retro-computer-with-crt-monitor-and-classic-keyboard-retro-style-personal-computer-nostalgia-concept-for-early-computer-technology-png.webp" alt="" className="fixed scale-800 top-4/7 left-3/7 z-1" /> */}
        {children}
      </body>
    </html>
  )
}
