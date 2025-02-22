import { YouTubeV1 } from "@/src/third-party-api/YouTubeAPI"
import TranscriptList from "./TranscriptList"

export default async function VideoTranscriptPage({
  params: { videoId },
}: {
  params: { videoId: string }
}) {
  const transcript = await YouTubeV1.scrapeTranscript(videoId)

  return (
    <div className="space-y-4 text-white">
      <TranscriptList transcript={transcript} />
    </div>
  )
}
