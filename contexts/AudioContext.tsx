"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { safePlayAudio } from "../utils/audio"

interface AudioContextType {
  isPlaying: boolean
  togglePlay: () => void
  setVolume: (volume: number) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audioElement = new Audio("/background-music.mp3")
    audioElement.loop = true
    setAudio(audioElement)

    return () => {
      audioElement.pause()
      audioElement.src = ""
    }
  }, [])

  const togglePlay = () => {
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        safePlayAudio(audio)
      }
      setIsPlaying(!isPlaying)
    }
  }

  const setVolume = (volume: number) => {
    if (audio) {
      audio.volume = volume
    }
  }

  useEffect(() => {
    const storedVolume = localStorage.getItem("musicVolume")
    if (storedVolume && audio) {
      audio.volume = Number.parseFloat(storedVolume)
    }
  }, [audio])

  return <AudioContext.Provider value={{ isPlaying, togglePlay, setVolume }}>{children}</AudioContext.Provider>
}

