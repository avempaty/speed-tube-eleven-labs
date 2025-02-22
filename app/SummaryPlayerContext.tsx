import { Summary } from "@/src/third-party-api/summaryUtils"
import React, { PropsWithChildren, createContext, useContext, useState } from "react"
import {
  VideoPlayerContext,
  VideoPlayerProvider,
  VideoPlayerState,
} from "./v/[videoId]/VideoPlayerContext"
import {
  SpeechSynthContext,
  SpeechSynthProvider,
  SpeechSynthState,
} from "./v/[videoId]/SpeechSynthContext"
import usePrevious from "@/components/hooks/usePrevious"

export enum SummaryPlayerState {
  Playing = "PLAYING",
  Paused = "PAUSED",
}

export enum Tab {
  SUMMARY = "SUMMARY",
  TRANSCRIPT = "TRANSCRIPT",
}

// TODO:
// TODO: use previous clip last frame for narrations
// TODO:

interface SummaryPlayerContextType {
  playerState: SummaryPlayerState | null
  segmentIndex: number | null
  transcript: Summary | null
  playSegment: (segmentIndex: number) => void
  playNextSegment: () => void
  setSummaryPlayerState: React.Dispatch<React.SetStateAction<SummaryPlayerState>>
  setTranscript: (transcript: Summary) => void
  activeTab: Tab
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>
}

export const SummaryPlayerContext = createContext<SummaryPlayerContextType>({
  playerState: null,
  segmentIndex: 0,
  transcript: null,
  playSegment: () => {},
  playNextSegment: () => {},
  setSummaryPlayerState: () => {},
  setTranscript: () => {},
  activeTab: Tab.TRANSCRIPT,
  setActiveTab: () => {},
})

function createUtteranceId(transcriptIndex: number, text: string) {
  return `${transcriptIndex}:${text}`
}

const SummaryPlayerInnerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [transcript, setTranscript] = useState<Summary | null>(null)
  const [playerState, _setSummaryPlayerState] = useState(SummaryPlayerState.Paused)
  const [segmentIndex, setSegmentIndex] = useState<number>(-1)
  const [activeTab, setActiveTab] = useState(Tab.SUMMARY)

  const previousSegmentIndex = usePrevious(segmentIndex)
  const previousTranscript = usePrevious(transcript)

  const videoPlayerContext = useContext(VideoPlayerContext)
  const speechSynthContext = useContext(SpeechSynthContext)

  const setSummaryPlayerState: React.Dispatch<
    React.SetStateAction<SummaryPlayerState>
  > = (value) => {
    const nextPlayerState = typeof value === "function" ? value(playerState) : value
    console.log("SM.CTX: setSummaryPlayerState", nextPlayerState)

    if (nextPlayerState === SummaryPlayerState.Playing) {
      if (segmentIndex === -1) {
        // first play, if the first segment is not a clip
        // we need to go ahead and play youtube attached to dom event
        // so that it loads correctly for subsequent clips
        console.log("SM.CTX: -1 clipPlayHack", 0, 1 / 1000, VideoPlayerState.Playing)
        videoPlayerContext.setCurrentTime(0, 1 / 1000)
        videoPlayerContext.setPlayerState(VideoPlayerState.Playing)
        videoPlayerContext.setMuted(true)
        speechSynthContext.resetUtterance()
        const segmentText = ""
        speechSynthContext.setUtterance(
          createUtteranceId(segmentIndex, segmentText),
          segmentText,
        )
        speechSynthContext.setPlayerState(SpeechSynthState.Playing)
        return
      }
    }

    const segment = transcript?.[segmentIndex]

    if (segment == null) return

    if (segment.type === "clip") {
      console.log("SM.CTX: setSummaryPlayerState", "clip", nextPlayerState)
      videoPlayerContext.setPlayerState(
        nextPlayerState == SummaryPlayerState.Playing
          ? VideoPlayerState.Playing
          : VideoPlayerState.Paused,
      )
    } else {
      console.log("SM.CTX: setSummaryPlayerState", "speech", nextPlayerState)
      speechSynthContext.setPlayerState(
        nextPlayerState == SummaryPlayerState.Playing
          ? SpeechSynthState.Playing
          : SpeechSynthState.Paused,
      )
    }

    _setSummaryPlayerState(nextPlayerState)
  }

  function playSegment(segmentIndex: number) {
    console.log("SM.CTX: playSegment", segmentIndex)

    if (segmentIndex === -1) {
      // first play, if the first segment is not a clip
      // we need to go ahead and play youtube attached to dom event
      // so that it loads correctly for subsequent clips
      console.log("SM.CTX: -1 clipPlayHack2", 0, 1 / 1000, VideoPlayerState.Playing)
      videoPlayerContext.setCurrentTime(0, 1 / 1000)
      videoPlayerContext.setPlayerState(VideoPlayerState.Playing)
      videoPlayerContext.setMuted(true)
      speechSynthContext.resetUtterance()
      const segmentText = ""
      speechSynthContext.setUtterance(
        createUtteranceId(segmentIndex, segmentText),
        segmentText,
      )
      speechSynthContext.setPlayerState(SpeechSynthState.Playing)
      setSegmentIndex(segmentIndex)
      _setSummaryPlayerState(SummaryPlayerState.Playing)
      return
    }

    const segment = transcript?.[segmentIndex]
    if (segment == null) return

    speechSynthContext.resetUtterance()
    if (segment.type === "clip") {
      videoPlayerContext.setCurrentTime(segment.startMs / 1000, segment.endMs / 1000)
      videoPlayerContext.setPlayerState(VideoPlayerState.Playing)
    } else {
      // TODO: try to get rid of reset by remove previous crap in speech player
      videoPlayerContext.setPlayerState(VideoPlayerState.Paused)
      // pause frame on last clip
      const leadingClip = transcript
        ?.slice(0, segmentIndex)
        .reverse()
        .find((s) => s.type === "clip")
      if (leadingClip?.type === "clip") {
        videoPlayerContext.setCurrentTime(leadingClip.endMs / 1000, Infinity)
      } else {
        videoPlayerContext.setCurrentTime(0, Infinity)
      }
      speechSynthContext.setUtterance(
        createUtteranceId(segmentIndex, segment.text),
        segment.text,
      )
      speechSynthContext.setPlayerState(SpeechSynthState.Playing)
    }

    setSegmentIndex(segmentIndex)
    _setSummaryPlayerState(SummaryPlayerState.Playing)
  }

  function pausePreviousSegment(segmentIndex: number) {
    console.log("SM.CTX: pausePreviousSegment", segmentIndex)
    if (segmentIndex === -2) {
      videoPlayerContext.setPlayerState(VideoPlayerState.Paused)
      videoPlayerContext.setCurrentTime(0, Infinity)
      return
    }
    if (segmentIndex === -1) {
      speechSynthContext.setPlayerState(SpeechSynthState.Paused)
      return
    }

    const segment = transcript?.[segmentIndex]
    if (segment == null) return

    if (segment.type === "clip") {
      videoPlayerContext.setPlayerState(VideoPlayerState.Paused)
    } else {
      speechSynthContext.setPlayerState(SpeechSynthState.Paused)
    }
  }

  function playNextSegment() {
    console.log("SM.CTX: playNextSegment", segmentIndex, 1)
    if (!transcript) {
      setSummaryPlayerState(SummaryPlayerState.Paused)
      return
    }

    const nextSegmentIndex = segmentIndex + 1

    if (nextSegmentIndex >= transcript.length) {
      setSegmentIndex(-1)
      setSummaryPlayerState(SummaryPlayerState.Paused)
      return
    }

    pausePreviousSegment(segmentIndex)
    playSegment(nextSegmentIndex)
  }

  const value: SummaryPlayerContextType = {
    playerState,
    segmentIndex,
    transcript,
    setSummaryPlayerState,
    setTranscript,
    playSegment,
    playNextSegment,
    activeTab,
    setActiveTab,
  }

  return (
    <SummaryPlayerContext.Provider value={value}>
      {children}
    </SummaryPlayerContext.Provider>
  )
}

export const SummaryPlayerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <SpeechSynthProvider>
      <VideoPlayerProvider>
        <SummaryPlayerInnerProvider>{children}</SummaryPlayerInnerProvider>
      </VideoPlayerProvider>
    </SpeechSynthProvider>
  )
}
