import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClickSound from "../components/ClickSound"
import { AudioProvider } from "../contexts/AudioContext"
import type React from "react"
import { LanguageProvider } from "../contexts/LanguageContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Map Game",
  description: "A maze game with levels",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <AudioProvider>
            {children}
            <ClickSound />
          </AudioProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

