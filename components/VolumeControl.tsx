"use client"

import { useState, useEffect } from "react"
import { useAudio } from "../contexts/AudioContext"

interface VolumeControlProps {
  type: "music" | "sound"
  initialVolume: number
}

export default function VolumeControl({ type, initialVolume }: VolumeControlProps) {
  const [volume, setVolume] = useState(initialVolume)
  const { setVolume: setAudioVolume } = useAudio()

  useEffect(() => {
    const storedVolume = localStorage.getItem(`${type}Volume`)
    if (storedVolume) {
      setVolume(Number.parseFloat(storedVolume))
    }
  }, [type])

  useEffect(() => {
    localStorage.setItem(`${type}Volume`, volume.toString())
    if (type === "music") {
      setAudioVolume(volume)
    }
    // 不需要在这里设置点击音效的音量，因为ClickSound组件会在每次播放时读取localStorage
  }, [volume, type, setAudioVolume])

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor={`${type}Volume`} className="text-white text-sm">
        {type === "music" ? "音乐" : "音效"}
      </label>
      <input
        type="range"
        id={`${type}Volume`}
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
        className="w-24"
      />
    </div>
  )
}

