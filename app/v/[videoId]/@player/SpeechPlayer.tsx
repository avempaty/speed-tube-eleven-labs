"use client"
import React, { useContext, useEffect } from "react"
import { SpeechSynthContext, SpeechSynthState } from "../SpeechSynthContext"
import usePrevious from "@/components/hooks/usePrevious"

const SpeechPlayer: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { playerState, utteranceId, utteranceText } = useContext(SpeechSynthContext)
  const previousUtteranceId = usePrevious(utteranceId)

  useEffect(() => {
    console.log("SP: playerState", playerState)
  }, [playerState])

  // useEffect(() => {
  //   console.log("SP: effect", playerState)

  //   if (utteranceText == null) {
  //     console.log("SP: cancel", playerState)
  //     window.speechSynthesis.pause()
  //     return
  //   }

  //   if (playerState === SpeechSynthState.Paused) {
  //     console.log("SP: pause", utteranceId?.split(":")[0], utteranceText)
  //     window.speechSynthesis.pause()
  //     return
  //   }
  // }, [playerState, utteranceId, utteranceText, onComplete])

  useEffect(() => {
    console.log("SP: effect", playerState)
    if (utteranceText == null) {
      console.log("SP: cancel", playerState)
      window.speechSynthesis.pause()
      return
    }

    // if paused, just pause
    if (playerState == SpeechSynthState.Paused) {
      console.log("SP: pause", utteranceId?.split(":")[0], utteranceText)
      window.speechSynthesis.pause()
      return
    }

    // play utterance
    let utterance: SpeechSynthesisUtterance | undefined
    if (utteranceId === previousUtteranceId) {
      console.log(
        "SP: resume",
        utteranceId?.split(":")[0],
        utteranceText,
        window.speechSynthesis,
      )
      // utterance is the same, play/pause toggled
      if (window.speechSynthesis.paused) {
        // utterance is not playing, play
        window.speechSynthesis.resume()
        return
      }
      // TODO: not sure about this, but fall through
    } else {
      console.log("SP: speak", utteranceId?.split(":")[0], utteranceText)
      // fall through
    }
    // utterance changed, speak new utterance
    window.speechSynthesis.cancel()
    // @ts-ignore
    utterance = window.utterance = new SpeechSynthesisUtterance(utteranceText as string)
    window.speechSynthesis.speak(utterance)
    // window.speechSynthesis.resume()
    utterance.onend = () => {
      console.log("SP: speak complete", utteranceId?.split(":")[0], utteranceText)
      // @ts-ignore
      if (utterance != window.utterance) return
      if (utteranceText === "") return // hack
      onComplete()
    }

    return () => {
      // cleanup
      console.log("SP: cleanup", utteranceId?.split(":")[0], utteranceText)
      //@ts-ignore
      if (utterance != window.utterance) utterance.onend = null
    }
  }, [utteranceId, previousUtteranceId, utteranceText, playerState, onComplete])

  return null
}

export default SpeechPlayer
