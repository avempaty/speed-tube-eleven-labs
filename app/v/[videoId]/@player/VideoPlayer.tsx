"use client"
import React, { useContext, useEffect, useRef, useState } from "react"
import ReactPlayer from "react-player"
import { VideoPlayerState, VideoPlayerContext } from "../VideoPlayerContext"

const VideoPlayer: React.FC<{
  videoId: string
  // controls: boolean
  onComplete: () => void
}> = ({ videoId, onComplete }) => {
  const {
    currentTime,
    pauseAtTime,
    setCurrentTime,
    setDuration,
    playerState,
    setPlayerState,
    muted,
  } = useContext(VideoPlayerContext)
  const [playedSeconds, setPlayedSeconds] = useState(currentTime)
  const playerRef = useRef<ReactPlayer | null>(null)
  const [firstPlay, setFirstPlay] = useState(true)

  useEffect(() => {
    if (muted) {
      // @ts-ignore
      playerRef?.current?.player?.mute && playerRef?.current?.player?.mute()
    } else {
      // @ts-ignore
      playerRef.current?.player?.unmute && playerRef.current?.player?.unmute()
    }
  }, [muted, playerRef])

  useEffect(() => {
    console.log(
      "VP: time changed",
      currentTime,
      playedSeconds,
      Math.abs(currentTime - playedSeconds),
    )
    if (currentTime === playedSeconds) return
    if (playerRef.current) {
      console.log("VP: seek", currentTime)
      playerRef.current.seekTo(currentTime, "seconds")
    }
  }, [playerRef, currentTime, playedSeconds, setPlayerState])

  return (
    <ReactPlayer
      ref={(player) => {
        playerRef.current = player
      }}
      config={{
        youtube: {
          playerVars: {
            rel: 0,
          },
        },
      }}
      controls
      //
      playing={playerState === VideoPlayerState.Playing}
      url={`https://www.youtube.com/watch?v=${videoId}&t=0`}
      width="100%"
      height="100%"
      playedSeconds
      // playedSeconds={currentTime === playedSeconds ? null : currentTime}
      onPlay={() => {
        console.log("VP: onPlay", playerState)
        if (playerState === VideoPlayerState.Playing) return
        setPlayerState(VideoPlayerState.Playing)
      }}
      onPause={() => {
        console.log("VP: onPause")
        if (playerState === VideoPlayerState.Paused) return
        setPlayerState(VideoPlayerState.Paused)
      }}
      onProgress={(state) => {
        console.log("VP: onProgress", state.playedSeconds)
        if (playerState !== VideoPlayerState.Playing) return
        // if (firstPlay) {
        //   if (Math.abs(state.playedSeconds - currentTime) > 1) {
        //     console.log(
        //       "VP: first play BUG",
        //       currentTime,
        //       Math.abs(state.playedSeconds - currentTime),
        //     )
        //     playerRef.current?.seekTo(currentTime, "seconds")
        //   }
        //   setFirstPlay(false)
        //   return
        // }

        setPlayedSeconds(state.playedSeconds)
        setCurrentTime(state.playedSeconds)
        setDuration(state.loadedSeconds)
        if (state.playedSeconds >= pauseAtTime) {
          // debugger
          if (pauseAtTime === 0) return // just ignore..
          console.log("VP: clip completed", state.playedSeconds, pauseAtTime)
          onComplete()
        }
      }}
      onReady={() => {
        const duration = playerRef.current?.getDuration()
        setDuration(duration || 0)
        // const volume = playerRef.current?.
      }}
      // onStart={() => {
      //   if (firstPlay) {
      //     setCurrentTime(0, 0)
      //     setPlayerState(VideoPlayerState.Paused)
      //     setFirstPlay(false)
      //   }
      // }}
    />
  )
}

export default VideoPlayer
