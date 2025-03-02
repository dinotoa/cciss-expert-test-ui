"use client"

import { useEffect, useState, useRef } from "react"
import { Play, Square, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function SpeechSynthesisPlayer({ text, onClose }: { text: string, onClose: () => void}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [volume, setVolume] = useState<number>(1)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const textRef = useRef<string>("")

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()?.filter(v => v.lang.startsWith("it"))
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
        setSelectedVoice(availableVoices[0].voiceURI)
      }
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null
      }
    }
  }, [])

  // Update textRef when text changes
  useEffect(() => {
    textRef.current = text
  }, [text])

  // Handle speech end event
  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsSpeaking(false)
      setProgress(0)
    }

    if (utteranceRef.current) {
      utteranceRef.current.onend = handleSpeechEnd
    }

    return () => {
      if (utteranceRef.current) {
        utteranceRef.current.onend = null
      }
    }
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const startSpeech = (startPosition = 0) => {
    if (!window.speechSynthesis || !textRef.current.trim()) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(textRef.current.slice(startPosition))
    utteranceRef.current = utterance

    // Set the selected voice
    const voice = voices.find((v) => v.voiceURI === selectedVoice)
    if (voice) {
      utterance.voice = voice
    }

    // Set volume
    utterance.volume = volume

    // Update progress as speech progresses
    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const currentPosition = startPosition + event.charIndex
        setProgress((currentPosition / textRef.current.length) * 100)
      }
    }

    // Start speaking
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
    setProgress((startPosition / textRef.current.length) * 100)
  }

  const stopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      setProgress(0)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)

    // Update volume of current utterance if speaking
    if (utteranceRef.current && isSpeaking) {
      utteranceRef.current.volume = newVolume
    }
  }

  const handleSeek = (value: number[]) => {
    const seekPosition = Math.floor((value[0] / 100) * textRef.current.length)
    if (isSpeaking) {
      stopSpeech()
      startSpeech(seekPosition)
    } else {
      setProgress(value[0])
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="space-y-4">
        <div className="space-y-2 flex gap-2 items-baseline">
          <label htmlFor="voice-select" className="text-sm font-medium">
            Voce
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select" className="w-full">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map((voice) => (
                <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center gap-4">
            <div className="w-[30%] flex justify-between items-center">
              <label htmlFor="volume-slider" className="text-sm font-medium">
                Volume
              </label>
              <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
            <div className="w-[70%] flex justify-between items-center">
              <label htmlFor="volume-slider" className="text-sm font-medium">
                0
              </label>
              <span className="text-sm text-muted-foreground">{Math.round(volume * 100)}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center gap-2">
            <div className="w-[30%] flex justify-between items-center gap-1">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="volume-slider"
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
              />
            </div>
            <div className="w-[70%] flex justify-between items-center">
              <Slider id="seek-slider" value={[progress]} min={0} max={100} step={0.1} onValueChange={handleSeek} />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={isSpeaking ? stopSpeech : () => startSpeech(Math.floor((progress / 100) * textRef.current.length))}
            disabled={!text.trim()}
            variant="default"
            className="w-32"
          >
            {isSpeaking ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button variant="outline" type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

