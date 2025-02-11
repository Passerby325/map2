export const safePlayAudio = async (audioElement: HTMLAudioElement | null) => {
  if (audioElement) {
    try {
      if (audioElement.readyState < 4) {
        await new Promise((resolve) => {
          audioElement.addEventListener("canplaythrough", resolve, { once: true })
          audioElement.load()
        })
      }
      await audioElement.play()
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }
}

export const setupAudioContext = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext
  const audioContext = new AudioContext()

  if (audioContext.state === "suspended") {
    const resumeAudio = async () => {
      await audioContext.resume()
      document.removeEventListener("click", resumeAudio)
      document.removeEventListener("touchstart", resumeAudio)
    }
    document.addEventListener("click", resumeAudio)
    document.addEventListener("touchstart", resumeAudio)
  }

  return audioContext
}

