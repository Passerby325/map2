"use client"

import { useEffect, useRef } from "react"
import { safePlayAudio } from "../utils/audio"

export default function ClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const handleClick = () => {
      const soundVolume = localStorage.getItem("soundVolume") || "0.5"
      
      // 如果已经有音频在播放，立即停止并重置
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // 创建新的音频实例
      const audio = new Audio("/click-sound.mp3")
      audio.volume = Number.parseFloat(soundVolume)
      audioRef.current = audio
      safePlayAudio(audio)
    }

    document.addEventListener("click", handleClick)

    return () => {
      document.removeEventListener("click", handleClick)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return null
}

