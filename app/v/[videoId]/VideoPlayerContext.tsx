import { Summary } from "@/src/third-party-api/summaryUtils"
import React, { PropsWithChildren, createContext, useCallback, useState } from "react"

export enum VideoPlayerState {
  Playing = "PLAYING",
  Paused = "PAUSED",
}

interface VideoPlayerContextType {
  currentTime: number
  duration: number | null
  pauseAtTime: number
  playerState: VideoPlayerState
  muted: boolean
  setCurrentTime: (currentTime: number, pauseAtTime?: number) => void
  setDuration: (duration: number) => void
  setPlayerState: (playerState: VideoPlayerState) => void
  // setPauseAtTime: (pauseAtTime?: number) => void
  setMuted: (muted: boolean) => void
}

export const VideoPlayerContext = createContext<VideoPlayerContextType>({
  currentTime: 0,
  duration: null,
  muted: false,
  pauseAtTime: Infinity,
  playerState: VideoPlayerState.Paused,
  setCurrentTime: () => {},
  setDuration: () => {},
  setPlayerState: () => {},
  setMuted: () => {},
  // setPauseAtTime: () => {},
})

export const VideoPlayerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [currentTime, _setCurrentTime] = useState(0)
  const [duration, setDuration] = useState<number | null>(null)
  const [muted, setMuted] = useState<boolean>(false)
  const [pauseAtTime, setPauseAtTime] = useState(Infinity)
  const [playerState, _setPlayerState] = useState(VideoPlayerState.Paused)

  const setCurrentTime = useCallback(
    function setCurrentTime(nextCurrentTime: number, nextPauseAtTime?: number) {
      console.log("VP.CTX: Set Time", nextCurrentTime, nextPauseAtTime)

      if (nextPauseAtTime != null) {
        setPauseAtTime(nextPauseAtTime)
      }
      _setCurrentTime(nextCurrentTime)
    },
    [setPauseAtTime, _setCurrentTime],
  )

  const setPlayerState = useCallback(
    function setPlayerState(nextPlayerState: VideoPlayerState) {
      console.log("VP.CTX: Set State", nextPlayerState)
      _setPlayerState(nextPlayerState)
    },
    [_setPlayerState],
  )

  // useEffect(() => {
  //   console.log("VP.CTX: completed clip???", playerState, currentTime, pauseAtTime)
  //   if (playerState === VideoPlayerState.Playing && currentTime >= pauseAtTime) {
  //     console.log("VP.CTX: completed clip")
  //     _setPlayerState(VideoPlayerState.Paused)
  //     setClipPlaybackCompleted(true)
  //   }
  // }, [playerState, currentTime, pauseAtTime])

  const value: VideoPlayerContextType = {
    currentTime,
    duration,
    pauseAtTime,
    playerState,
    muted,
    setCurrentTime,
    setDuration,
    setPlayerState,
    setMuted,
    // setPauseAtTime
  }

  return (
    <VideoPlayerContext.Provider value={value}>{children}</VideoPlayerContext.Provider>
  )
}
