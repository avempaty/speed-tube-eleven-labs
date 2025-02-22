"use client"

import { MouseEventHandler, useContext } from "react"
import { SummaryPlayerContext, SummaryPlayerState } from "../../../SummaryPlayerContext"
import PlayButton from "@/components/PlayButton"

const SummaryPlayButton: React.FC<{
  className?: string | undefined
  onClick?: MouseEventHandler<HTMLButtonElement>
}> = ({ className, onClick }) => {
  const {
    playerState,
    transcript: summaryTranscript,
    setSummaryPlayerState,
  } = useContext(SummaryPlayerContext)

  return (
    <PlayButton
      className={className}
      isLoading={summaryTranscript == null}
      isPlaying={playerState === SummaryPlayerState.Playing}
      onClick={(e) => {
        setSummaryPlayerState((currState: SummaryPlayerState) => {
          if (currState === SummaryPlayerState.Playing) {
            return SummaryPlayerState.Paused
          } else {
            return SummaryPlayerState.Playing
          }
        })
        if (onClick) onClick(e)
      }}
    />
  )
}

export default SummaryPlayButton
