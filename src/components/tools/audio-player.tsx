"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Play, Pause } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AudioPlayerProps {
  id?: string
  className?: string
  title?: string
  src: string
}

export function AudioPlayer({ id = "audio-player", className, src, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener("loadeddata", setAudioData)
    audio.addEventListener("timeupdate", setAudioTime)

    return () => {
      audio.removeEventListener("loadeddata", setAudioData)
      audio.removeEventListener("timeupdate", setAudioTime)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current?.paused) {
      audioRef.current.play()
      setIsPlaying(true)
    } else {
      audioRef.current?.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeChange = (newValue: number[]) => {
    const [time] = newValue
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (newValue: number[]) => {
    const [vol] = newValue
    if (audioRef.current) {
      audioRef.current.volume = vol
      setVolume(vol)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className={cn("w-full max-w-md mx-auto bg-background shadow-lg rounded-lg overflow-hidden", className)}>
      <audio ref={audioRef} src={src} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button onClick={togglePlay} variant="outline" size="icon">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div>{title}</div>
          <div className="text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        <Slider
          min={0}
          max={duration}
          step={1}
          value={[currentTime]}
          onValueChange={handleTimeChange}
          className="mb-4"
        />
        <div className="flex items-center">
          {volume === 0 ? <VolumeX className="h-4 w-4 mr-2" /> : <Volume2 className="h-4 w-4 mr-2" />}
          <Slider min={0} max={1} step={0.01} value={[volume]} onValueChange={handleVolumeChange} className="w-24" />
        </div>
      </div>
    </div>
  )
}
