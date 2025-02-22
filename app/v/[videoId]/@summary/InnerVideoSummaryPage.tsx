"use client"

import msToTimestamp from "@/src/common/msToTimestamp"
import { Summary } from "@/src/third-party-api/summaryUtils"
import { useContext, useEffect, useRef, useState } from "react"
import SummaryPlayButton from "./SummaryPlayButton"
import SummaryTranscriptList from "./SummaryTranscriptList"
import LoadingPage from "./loading"
import { YouTubeTranscript } from "@/src/third-party-api/YouTubeAPI"
import { useCompletion } from "ai/react"
import { toast } from "sonner"
import va from "@vercel/analytics"
import jsonParserStream from "@/src/common/rx/jsonParserStream"
import { Subject } from "rxjs"
import trimBefore from "@/src/common/rx/trimBefore"
import chunkStringAppends from "@/src/common/rx/chunkStringAppends"
import { SummaryPlayerContext, SummaryPlayerState } from "../../../SummaryPlayerContext"

let sent = false

// TODO: not sure if this wrapper is necessary
export default function InnerVideoSummaryPage({
  videoId,
  transcript,
}: {
  videoId: string
  transcript: YouTubeTranscript
}) {
  const {
    transcript: summaryTranscript,
    setTranscript: setSummaryTranscript,
    playerState,
    setSummaryPlayerState,
  } = useContext(SummaryPlayerContext)
  const completionStreamRef = useRef<Subject<string>>(new Subject<string>())
  const transcriptStreamRef = useRef<Subject<string>>(new Subject<string>())
  const jsonStreamRef = useRef<ReturnType<typeof jsonParserStream<Summary[0]>>>(
    jsonParserStream<Summary[0]>(transcriptStreamRef.current),
  )

  /*
   * completion hooks
   */
  const { complete, completion, isLoading, stop } = useCompletion({
    id: "summarize",
    api: `/api/summarize/${videoId}`,
    onResponse: (response) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.")
        va.track("Rate Limit Reached")
        return
      }
    },
    onFinish: (_prompt, completion) => {
      console.log("RESPONSE", completion)
      const summaryTranscript = JSON.parse(
        completion.replace(/[\s\S]*?\n\{/, "{") as string,
      ).output
      console.log("SUMMARY_TRANSCRIPT", summaryTranscript)
      setSummaryTranscript(summaryTranscript)
    },
    onError: () => {
      toast.error("Something went wrong.")
    },
  })

  // send transcript to server
  useEffect(() => {
    if (!transcript) return
    if (sent) return
    sent = true
    complete(JSON.stringify(transcript))
  }, [complete, transcript])

  /*
   * streaming summary hooks
   */

  const [completionSeen, setCompletionSeen] = useState<string>("")

  useEffect(() => {
    if (!completion) return
    console.log("COMPLETION", completion)
    completionStreamRef.current.next(completion)
  }, [completion])

  const [streamingSummary, setStreamingSummary] = useState<Summary>([])

  // parse streaming summary chunks parsing completed transcript objects and pushing them to streamingSummary
  useEffect(() => {
    if (jsonStreamRef.current == null) return

    const completionStream = completionStreamRef.current
    const transcriptStream = transcriptStreamRef.current
    const jsonStream = jsonStreamRef.current

    // @ts-ignore
    if (jsonStream.subscribed) {
      console.log("blocked bitch!")
      return
    }
    // @ts-ignore
    jsonStream.subscribed = true

    jsonStream.subscribe({
      next: (chunk) => {
        console.log("New Chunk PARSED ITEMS", chunk)
        setStreamingSummary((prev) => [...prev, chunk])
      },
      error: (err) => {
        console.log("JSON STREAM ERROR", err)
      },
      complete: () => {
        console.log("JSON STREAM COMPLETE")
      },
    })
    let i: number = 0
    completionStream
      .pipe(chunkStringAppends)
      .pipe(trimBefore("["))
      .subscribe({
        next: (chunk) => {
          console.log("New Chunk Stream!", ++i, chunk)
          transcriptStream.next(chunk)
        },
        error: (err) => {
          transcriptStream.error(err)
        },
        complete: () => {
          transcriptStream.complete()
        },
      })
  }, [jsonStreamRef])

  useEffect(() => {
    if (streamingSummary != null) return

    setSummaryTranscript(streamingSummary)
  }, [streamingSummary, setSummaryTranscript])

  if (!summaryTranscript && streamingSummary.length === 0) return <LoadingPage />

  return <SummaryTranscriptList transcript={summaryTranscript ?? streamingSummary} />
}
