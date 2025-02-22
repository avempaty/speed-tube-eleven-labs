"use client"

import { useContext, useMemo } from "react"
import SummaryTranscriptSegment from "./SummaryTranscriptSegment"
import { Summary } from "@/src/third-party-api/summaryUtils"
import { SummaryPlayerContext, SummaryPlayerState } from "../../../SummaryPlayerContext"
import { VideoPlayerContext, VideoPlayerState } from "../VideoPlayerContext"
import { SpeechSynthContext } from "../SpeechSynthContext"

export default function SummaryTranscriptList({ transcript }: { transcript: Summary }) {
  const { segmentIndex, playerState, playSegment, setSummaryPlayerState } =
    useContext(SummaryPlayerContext)
  // TODO: maybe dont use this here?
  const {
    currentTime,
    playerState: videoPlayerState,
    setCurrentTime,
  } = useContext(VideoPlayerContext)
  const { resetUtterance } = useContext(SpeechSynthContext)

  return (
    <div className="h-full">
      {transcript.map((segment, index) => {
        let isActive = false
        if (segmentIndex === index && playerState === SummaryPlayerState.Playing) {
          isActive = true
        } else if (segment.type === "clip") {
          const startSeconds = (segment.startMs ?? 0) / 1000
          const endSeconds = (segment.endMs ?? 0) / 1000

          isActive =
            currentTime >= startSeconds &&
            currentTime < endSeconds &&
            videoPlayerState === VideoPlayerState.Playing
        }

        return (
          <SummaryTranscriptSegment
            key={index}
            segment={segment}
            segmentIndex={index}
            isActive={isActive}
            onClick={(segmentIndex) => {
              // if (segment.type === "clip") {
              //   // always reset timestamp on click
              //   setCurrentTime(segment.startMs / 1000, segment.endMs / 1000)
              // } else {
              //   // how to restart narration?
              //   resetUtterance()
              // }
              // setSegmentIndex(segmentIndex)
              // setSummaryPlayerState(SummaryPlayerState.Playing)
              playSegment(segmentIndex)
            }}
          />
        )
      })}
    </div>
  )
}
