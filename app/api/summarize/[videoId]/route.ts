import { AnthropicStream, OpenAIStream, StreamingTextResponse } from "ai"
import timeout from "abortable-timeout"
// import { experimental_buildAnthropicPrompt } from "ai/prompts"

import { Ratelimit } from "@/src/db/models/rateLimitModel"
import { getClientIP } from "@/src/common/getClientIP"
import { get } from "env-var"
import {
  summarizeYouTubeTranscriptUsingClaudeSDKStream,
  summarizeYouTubeTranscriptUsingChatGPTStream,
} from "@/src/third-party-api/summaryUtils"
import { YouTubeTranscript } from "@/src/third-party-api/YouTubeAPI"
import summaryCacheModel from "@/src/db/models/summaryCacheModel"
import concatBufferStream from "@/src/common/concatBufferStream"
// import { cacheReadableStreamToDisk } from "@/src/common/streams/readableStreamCache"

const MOCK_SUMMARY = get("MOCK_SUMMARY").default("false").asBool()
const USE_OPENAI = get("USE_OPENAI").default("false").asBool()

export const runtime = "edge"

function stringToReadableStream(string: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(string)

  return new ReadableStream({
    start(controller) {
      controller.enqueue(data)
      controller.close()
    },
  })
}

export async function POST(
  req: Request,
  { params }: { params: { videoId: string } },
): Promise<Response> {
  // get ip address
  const ipInfo = getClientIP(req as unknown as Request)
  const ip = ipInfo?.ip

  // get client ip
  if (ip == null) return new Response("No IP address found.", { status: 400 })

  // get rate limit info for client ip
  const limitInfo = await new Ratelimit().globalLimit({ ip })
  console.log("RATELIMIT", {
    success: limitInfo?.success,
    limit: limitInfo?.limit,
    remaining: limitInfo?.remaining,
    reset: limitInfo?.reset,
  })

  // check rate limit for ip
  if (!limitInfo.success) {
    // rate limit for ip exceeded
    return new Response("You have reached your request limit for the day.", {
      status: 429,
      headers: {
        "X-RateLimit-Limit": limitInfo.limit.toString(),
        "X-RateLimit-Remaining": limitInfo.remaining.toString(),
        "X-RateLimit-Reset": limitInfo.reset.toString(),
      },
    })
  }

  // Extract the `prompt` from the body of the request
  const json = await (req as unknown as Request).json()

  let cached: string | null = null

  if (MOCK_SUMMARY) {
    // @ts-ignore
    const cachedModule = await import("./cachelite.txt")
    cached = cachedModule.default
    console.warn("using mock summary", cached)
    await timeout(1 * 1000, null)
  } else {
    const record = await summaryCacheModel.getOneById(params.videoId)
    cached = record?.summary ?? null
  }

  if (cached) {
    console.log("cache hit!", cached.length)
    return new StreamingTextResponse(stringToReadableStream(cached))
  }

  let stream: ReadableStream<Uint8Array>

  if (USE_OPENAI) {
    // Ask OpenAI for a streaming chat completion given the prompt
    const response = await summarizeYouTubeTranscriptUsingChatGPTStream(
      JSON.parse(json.prompt) as YouTubeTranscript,
    )
    // Convert the response into a friendly text-stream
    stream = OpenAIStream(response) // buffer stream?
  } else {
    // Ask Claude for a streaming chat completion given the prompt
    const response = await summarizeYouTubeTranscriptUsingClaudeSDKStream(
      JSON.parse(json.prompt) as YouTubeTranscript,
    )
    // Convert the response into a friendly text-stream
    stream = AnthropicStream(response) // buffer stream?
  }

  const [cacheStream, resStream] = stream.tee()

  // TODO: is this happening in bg okay?
  new Promise<string>((resolve, reject) => {
    cacheStream.pipeTo(concatBufferStream(resolve))
  })
    .then((text: string) => {
      // save to db
      console.log("write to cache!", typeof text, text.length)
      return summaryCacheModel.upsert({
        videoId: params.videoId,
        summary: text,
      })
    })
    .catch((err) => {
      console.error("error caching summary to db", err)
    })

  // pipe to response
  const res = new StreamingTextResponse(resStream)

  // Respond with the stream
  return res
}
