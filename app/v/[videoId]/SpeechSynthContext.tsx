import usePrevious from "@/components/hooks/usePrevious"
import { Summary } from "@/src/third-party-api/summaryUtils"
import React, { PropsWithChildren, createContext, use, useEffect, useState } from "react"

export enum SpeechSynthState {
  Playing = "PLAYING",
  Paused = "PAUSED",
}

interface SpeechSynthContextType {
  utteranceId: string | null
  utteranceText: string | null
  playerState: SpeechSynthState
  // setUtteranceId: (utteranceId: string) => void
  // setUtteranceText: (utteranceText: string) => void
  setUtterance: (utteranceId: string, utteranceText: string) => void
  resetUtterance: () => void
  setPlayerState: (playerState: SpeechSynthState) => void
}

export const SpeechSynthContext = createContext<SpeechSynthContextType>({
  utteranceId: null,
  utteranceText: null,
  playerState: SpeechSynthState.Paused,
  // setUtteranceId: () => {},
  // setUtteranceText: () => {},
  setUtterance: () => {},
  resetUtterance: () => {},
  setPlayerState: () => {},
})

export const SpeechSynthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [utteranceId, setUtteranceId] = useState<string | null>(null)
  const [utteranceText, setUtteranceText] = useState<string | null>(null)
  const [playerState, setPlayerState] = useState<SpeechSynthState>(
    SpeechSynthState.Paused,
  )

  function setUtterance(utteranceId: string, utteranceText: string) {
    console.log("SP.CTX: utterance", utteranceId, utteranceText)
    setUtteranceId(utteranceId)
    setUtteranceText(utteranceText)
  }

  function resetUtterance() {
    console.log("SP.CTX: reset utterance")
    setUtteranceId(null)
    setUtteranceText(null)
  }

  const value: SpeechSynthContextType = {
    utteranceId,
    utteranceText,
    playerState,
    // setUtteranceId,
    // setUtteranceText,
    setUtterance,
    resetUtterance,
    setPlayerState,
  }

  return (
    <SpeechSynthContext.Provider value={value}>{children}</SpeechSynthContext.Provider>
  )
}
