import { YouTubeV1 } from "@/src/third-party-api/YouTubeAPI"
import { get } from "env-var"
import authOptions from "./../../auth/[...nextauth]/authOptions"
import { getServerSession } from "next-auth"

const YOUTUBE_API_KEY = get("YOUTUBE_API_KEY").required().asString()

export async function GET(req: Request): Promise<Response> {
  const session = await getServerSession(authOptions)
  console.log("YT SESSION", session)
  // parse query params

  // const query = {
  //   format: "vtt" as YouTubeCaptionFormat,
  //   language: "en",
  // }

  const transcripts = await YouTubeV1.scrapeTranscript("1X7fzOr3ftg")

  return new Response(JSON.stringify(transcripts), {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  })
}
