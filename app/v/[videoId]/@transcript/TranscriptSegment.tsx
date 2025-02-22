"use client"

import { YouTubeTranscriptSegment } from "@/src/third-party-api/YouTubeAPI"
import { useEffect, useRef } from "react"

const TranscriptSegment: React.FC<{
  isActive: boolean
  onClick: (segment: YouTubeTranscriptSegment) => unknown
  segment: YouTubeTranscriptSegment
}> = ({ isActive, onClick, segment }) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (isActive) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [isActive, ref])

  return (
    <div
      ref={ref}
      className={`flex flex-row p-1 rounded ${
        isActive ? "bg-yellow-200 bg-opacity-30" : ""
      }`}
      onClick={() => {
        onClick(segment)
      }}
    >
      <div className="w-1/6 pr-6 flex justify-end">
        <div className="timestamp bg-gray-400 text-gray-800 font-mono p-1 w-fit rounded leading-none">
          {segment.startTimestamp}
        </div>
      </div>

      <div className="w-5/6 pr-4">{segment.text}</div>
    </div>
  )
}

export default TranscriptSegment
