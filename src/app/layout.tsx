import "./globals.css"
import { ReactNode } from "react"
import localFont from "next/font/local"

const myFont = localFont({
  src: './fonts/Oswald-VariableFont_wght.ttf',
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
      <body className="bg-gradient-to-tr from-blue-950 to-black overflow-hidden">
      {/* <img src="front-view-of-vintage-beige-retro-computer-with-crt-monitor-and-classic-keyboard-retro-style-personal-computer-nostalgia-concept-for-early-computer-technology-png.webp" alt="" className="fixed scale-800 top-4/7 left-3/7 z-1" /> */}
        {children}
      </body>
    </html>
  )
}
