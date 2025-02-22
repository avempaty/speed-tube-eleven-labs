"use client"

import { YouTubeTranscript } from "@/src/third-party-api/YouTubeAPI"
import { useContext } from "react"
import { SummaryPlayerContext, SummaryPlayerState } from "../../../SummaryPlayerContext"
import TranscriptSegment from "./TranscriptSegment"
import { VideoPlayerContext, VideoPlayerState } from "../VideoPlayerContext"

export default function TranscriptList({
  transcript,
}: {
  transcript: YouTubeTranscript
}) {
  const { setSummaryPlayerState } = useContext(SummaryPlayerContext)
  const { currentTime, setCurrentTime, setPlayerState } = useContext(VideoPlayerContext)

  return (
    <div className="h-full">
      {transcript.map((item, index) => {
        const startSeconds = (item.startMs ?? 0) / 1000
        const endSeconds = (item.endMs ?? 0) / 1000
        const isActive = currentTime >= startSeconds && currentTime < endSeconds

        return (
          <TranscriptSegment
            key={index}
            segment={item}
            isActive={isActive}
            onClick={(segment) => {
              // TODO: fixme
              // setSummaryPlayerState(SummaryPlayerState.Paused)
              setCurrentTime(startSeconds)
              setPlayerState(VideoPlayerState.Playing)
            }}
          />
        )
      })}
    </div>
  )
}
