"use client"

import { useContext, useEffect, useState } from "react"
import { SummaryPlayerContext } from "../../../SummaryPlayerContext"
import msToTimestamp from "@/src/common/msToTimestamp"

const SummaryDuration: React.FC<{ className?: string | undefined }> = ({ className }) => {
  const { transcript: summaryTranscript, setTranscript: setSummaryTranscript } =
    useContext(SummaryPlayerContext)
  const [summaryDuration, setSummaryDuration] = useState<number | null>(null)

  // summary transcript processing
  useEffect(() => {
    if (!summaryTranscript) return
    console.log("SUMMARY_TRANSCRIPT", summaryTranscript)
    // calculate summary duration using useMemo
    const summaryDuration = summaryTranscript.reduce((acc, item) => {
      if (item.type === "clip") {
        return acc + (item.endMs ?? 0) - (item.startMs ?? 0)
      } else {
        // assume 150 words per minute for narration
        const words = item.text.split(" ").length
        const duration = (words / 150) * 60 * 1000
        return acc + duration
      }
    }, 0)
    setSummaryDuration(summaryDuration)
  }, [summaryTranscript])

  return (
    <>
      {summaryDuration != null ? (
        <div className={className}>
          <span>Duration:&nbsp;</span>
          <span className="font-mono">{msToTimestamp(summaryDuration)}</span>
        </div>
      ) : null}
    </>
  )
}

export default SummaryDuration
