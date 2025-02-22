"use client"
import React, { useContext } from "react"
import VideoPlayer from "./VideoPlayer"
import SpeechPlayer from "./SpeechPlayer"
import { SummaryPlayerContext } from "../../../SummaryPlayerContext"

const PlayerPage: React.FC<{ params: { videoId: string } }> = ({
  params: { videoId },
}) => {
  const { playNextSegment, activeTab } = useContext(SummaryPlayerContext)

  return (
    <>
      <VideoPlayer
        videoId={videoId}
        onComplete={() => {
          playNextSegment()
        }}
      />
      <SpeechPlayer
        onComplete={() => {
          playNextSegment()
        }}
      />
    </>
  )
}

export default PlayerPage
