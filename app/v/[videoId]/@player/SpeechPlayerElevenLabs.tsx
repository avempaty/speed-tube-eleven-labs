"use client"
import React, { useContext, useEffect, useRef } from "react"
import { SpeechSynthContext, SpeechSynthState } from "../SpeechSynthContext"
import { get } from "env-var"
import usePrevious from "@/components/hooks/usePrevious"
import { ElevenLabsClient } from "elevenlabs"

const ELEVEN_LABS_API_KEY = get("ELEVEN_LABS_API_KEY").required().asString()

const SpeechPlayerElevenLabs: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { playerState, utteranceId, utteranceText } = useContext(SpeechSynthContext)
  const previousUtteranceId = usePrevious(utteranceId)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const client = new ElevenLabsClient({
    apiKey: ELEVEN_LABS_API_KEY,
  })

  useEffect(() => {
    console.log("SP: effect", playerState)

    if (!utteranceText) {
      console.log("SP: cancel", playerState)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      return
    }

    if (playerState === SpeechSynthState.Paused) {
      console.log("SP: pause", utteranceId?.split(":")[0], utteranceText)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      return
    }

    if (utteranceId !== previousUtteranceId) {
      console.log("SP: speak", utteranceId?.split(":")[0], utteranceText)

      const fetchAudio = async () => {
        try {
          const audioStream = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
            text: utteranceText,
            model_id: "eleven_multilingual_v2",
            output_format: "mp3_44100_128",
          })

          const chunks: Uint8Array[] = []
          for await (const chunk of audioStream) {
            chunks.push(new Uint8Array(chunk))
          }
          const audioBuffer = Buffer.concat(chunks)
          const blob = new Blob([audioBuffer], { type: "audio/mpeg" })
          const audioUrl = URL.createObjectURL(blob)

          if (audioRef.current) {
            audioRef.current.src = audioUrl
            audioRef.current.onended = () => {
              console.log("SP: speak complete", utteranceId?.split(":")[0], utteranceText)
              onComplete()
            }
            audioRef.current.play()
          }
        } catch (err) {
          console.error("Error fetching audio stream:", err)
        }
      }

      fetchAudio()
    } else if (playerState === SpeechSynthState.Playing && audioRef.current?.paused) {
      console.log("SP: resuming playback")
      audioRef.current.play()
    }

  }, [utteranceId, previousUtteranceId, utteranceText, playerState, onComplete])

  return <audio ref={audioRef} controls />
}

export default SpeechPlayerElevenLabs
