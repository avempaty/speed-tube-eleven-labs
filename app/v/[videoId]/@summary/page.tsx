import { YouTubeV1 } from "@/src/third-party-api/YouTubeAPI"
import InnerVideoSummaryPage from "./InnerVideoSummaryPage"

export default async function VideoSummaryPage({
  params: { videoId },
}: {
  params: { videoId: string }
}) {
  const transcript = await YouTubeV1.scrapeTranscript(videoId)

  return <InnerVideoSummaryPage videoId={videoId} transcript={transcript} />
}
