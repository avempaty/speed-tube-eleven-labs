"use client"

import msToTimestamp from "@/src/common/msToTimestamp"
import { SummarySegment } from "@/src/third-party-api/summaryUtils"
import { useEffect, useRef } from "react"

const SummaryTranscriptSegment: React.FC<{
  isActive: boolean
  onClick: (segmentIndex: number) => unknown
  segment: SummarySegment
  segmentIndex: number
}> = ({ isActive, onClick, segment, segmentIndex }) => {
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
      className={`text-white flex flex-row cursor-pointer mb-3 p-1 rounded ${
        isActive ? "bg-yellow-200 bg-opacity-30" : ""
      }`}
      onClick={() => {
        onClick(segmentIndex)
      }}
    >
      {segment.type !== "clip" && <div className="w-full pr-4">{segment.text}</div>}
      {segment.type === "clip" && (
        <>
          <div className="w-full pr-4 text-gray-400 italic">{segment.text}</div>
          <div className="flex-none">
            <div className="timestamp bg-gray-400 text-gray-800 font-mono p-1 rounded leading-none">
              {msToTimestamp(segment.startMs)}&nbsp;-&nbsp;{msToTimestamp(segment.endMs)}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default SummaryTranscriptSegment
