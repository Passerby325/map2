"use client"

import { useEffect, useRef } from "react"
import { safePlayAudio } from "../utils/audio"

export default function ClickSound() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const handleClick = () => {
      const soundVolume = localStorage.getItem("soundVolume") || "0.5"
      if (audioRef.current) {
        audioRef.current.volume = Number.parseFloat(soundVolume)
        safePlayAudio(audioRef.current)
      }
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <audio ref={audioRef}>
      <source src="/click-sound.mp3" type="audio/mpeg" />
    </audio>
  )
}

