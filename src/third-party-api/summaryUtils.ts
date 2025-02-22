// Import necessary libraries and modules
// import { OpenAI as LangOpenAI } from "langchain/llms/openai"
// import { RetrievalQAChain } from "langchain/chains"
// import { HNSWLib } from "langchain/vectorstores/hnswlib"
// import { OpenAIEmbeddings } from "langchain/embeddings/openai"
// import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { YouTubeTranscript } from "./YouTubeAPI"
import { get } from "env-var"
// import path from "path"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { Stream as AnthropicStream } from "@anthropic-ai/sdk/streaming.mjs"
import { MessageParam } from "@anthropic-ai/sdk/resources/messages.mjs"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { Stream as OpenAIStream } from "openai/streaming.mjs"
// import "hnswlib-node"
// import { WebBaseLoader } from "langchain"
// import { ChatOpenAI } from "langchain"
// import { load_summarize_chain } from "langchain"

// USE_OPENAI is used in the route handler

const OPENAI_API_KEY = get("OPENAI_API_KEY").required().asString()
const OPENAI_MODEL = get("OPENAI_MODEL").default("o1-preview").asString()

const CLAUDE_API_KEY = get("CLAUDE_API_KEY").required().asString()
const CLAUDE_MODEL = get("CLAUDE_MODEL").default("claude-3-5-sonnet-latest").asString()

// const PROMPT = `
// Imagine you are a smart AI assistant designed to provide a speed narration and real-time highlight clips playback for YouTube videos. Your task is to generate a condensed yet informative narration of the video, while also selecting key highlight clips to be played in real-time to enhance the user's understanding and engagement.

// The transcript is provided within the "transcript" xml tags in text format that include timestamps in seconds and milliseconds and text spoken beginning at each timestamps

// <transcript>
// $$$$___TRANSCRIPT
// </transcript>

// When summarizing follow the Chain of Density (CoD) summarization approach to ensure the narration is dense with salient information from the video. Start with a brief summary and iteratively add 1-3 missing salient points or entities from the video in each iteration without increasing the overall length of the narration. Ensure that the summary remains clear, informative, and engaging.

// Now, based on the video transcript provided within xml tag "transcript", create the informative narrated summary and highlight reel clip script mirroring the format of the json example provided within xml tag "output-format-example" (note this is just an example purely for format and the contents are not related to the video transcript in any way) below and please only respond with pure, vanilla json output no textual AI response (like avoid 'Here is a summarized narration...' just response with pure json.
// <output-format-example>
// [
//   {
//     "type": "narration",
//     "text": "The interview opens with Kanye and Zane reminiscing about previous collaborations like Abbey Road and Cruel Summer."
//   },
//   {
//     "type": "clip",
//     "startMs": 13980,
//     "endMs": 19859,
//     "text": "[Kanye and Zane discuss Kanye stepping outside his comfort zone early in his career.]"
//   }
//   // alot more depending on the length of the video and important highlights in the video
// ]
// </output-format-example>
// `

// const PROMPT = `
// Imagine you are an AI assistant created by Anthropic to summarize YouTube video transcripts. Your goal is to provide users with condensed overviews of long videos by identifying the key topics, speakers, and highlights.
// When given a YouTube video transcript, carefully read through it to understand the main ideas and events. Summarize the key points in clear, concise language. Break the transcript into logical sections using descriptive narration summaries in between realtime clip dialogues when appropriate.
// For realtime clips, specify the start and end times and transcribe the most relevant dialog. Focus on including clips that represent the main speakers and topics. Use your judgment to determine the most informative parts to transcribe versus summarize.
// Craft your summaries and clip selections to produce a condensed overview that helps users quickly grasp the main points and speakers of the video. Present your summarized transcript in an easy-to-digest JSON format for integration into applications. Approach each video analytically and insightfully to generate high quality, useful summaries.
// Imagine you are a youtube speed narration and clip playing application. create a transcript for this video including parts that you narrate a summary for and specify which clips should be played in realtime for the user instead of raw text give me a json output for the content above
// Summarize the following youtube video transcript into a narrated highlight reel script for the video in pure vanilla json mirroring the format provide in "output-format-example" xml tags (note this is purely a format example and the length of the out has no limit, it should maximize conveying information)

// <output-format-example>
// [
//   {
//     "type": "narration",
//     "text": "<AI narrated text summarizing video parts and segwaying between highlights>"
//   },
//   {
//     "type": "clip",
//     "startMs": <start milliseconds>,
//     "endMs": <start milliseconds>,
//     "text": "[<AI description of highlight clip>]"
//   }
//   ...
// ]
// </output-format-example>

// here is the youtube video transcript to summarize provided in xml tags "transcript"

// <transcript>
// $$$$___TRANSCRIPT
// </transcript>
// `

// Title: {video title}
// Description: {video description}
// const PROMPT = `
// Video Transcript enclosed in 'transcript' xml tags the transcript of the video includes start milliseconds, end milliseconds, and text spoken between the timestamps:
// <transcript>
// $$$$___TRANSCRIPT
// </transcript>

// Imagine you are an AI created to generate a narrated highlight reel of YouTube videos. Your task is to utilize the Chain of Density (CoD) summarization approach to produce a condensed yet informative narration of the video, interweaving key highlight clips for real-time playback to augment the user's understanding and engagement.

// As an AI developed to generate a narrated highlight reel of YouTube videos, your task is to employ the Chain of Density (CoD) summarization approach to distill the video into a condensed yet insightful narration, interweaving key highlight clips to enrich the viewer's understanding and engagement.

// Your narration should focus on covering all meaningful topics in the video while glossing over repetitive or less significant discussions. Highlight clips should encapsulate the crux of essential dialogues or events, and they do not have to match the transcript segments precisely. They should be long enough to convey the topic effectively, thus saving the viewer's time on consuming the content.

// Now, based on the provided video title, description, and transcript, create an instructive narrated summary and highlight reel script. Your response should solely comprise the vanilla json output mirroring the format provided below, devoid of any textual AI response enclosed in 'example-output-format' xml tags:
// <example-output-format>
// [
//   {
//     "type": "narration",
//     "text": "<AI narrated text summarizing video parts and segueing between highlights>"
//   },
//   {
//     "type": "clip",
//     "startMs": <start milliseconds>,
//     "endMs": <end milliseconds>,
//     "text": "<AI description of highlight clip>"
//   }
//   ...
// ]
// </example-output-format>
// `

// <title>{video title}</title>
// <description>{video description}</description>
// const PROMPT = `
// <video>
//   <title>{video title}</title>
//   <description>{video description}</description>
//   <transcript>{video transcript}</transcript>
// </video>

// Envision yourself as an AI host for a Highlight Reel Show, crafted to condense YouTube videos into engaging narratives interweaved with real-time highlight clips, employing the Chain of Density (CoD) summarization approach. Your mission is to save viewers time by covering all meaningful topics from the video while condensing less significant or repetitive parts with engaging narration.

// As you dissect the video transcript, identify key topics, speakers, and highlights. Break the transcript into logical sections, summarizing drawn-out parts with clear, concise language, and selecting highlight clips that encapsulate the most informative or entertaining segments. Each narrated segment should segue seamlessly into the next highlight clip, maintaining a coherent narrative that walks the viewer through the video.

// Initiate the highlight reel show with a narrated introduction, setting the stage for what the viewer is about to experience. Proceed in a chronological order, alternating between narrated summaries and highlight clips, ensuring a fluid transition that maintains the chronological integrity of the video content.

// For each highlight clip, specify the start and end times, and transcribe the most relevant dialogue, ensuring the clips represent the main speakers and topics. Exercise discernment aiming to provide a condensed yet informative overview that helps users quickly grasp the main points of the video.

// Now, based on the video information enclosed within the XML tags, generate a script for the Highlight Reel Show. Your response should be a vanilla JSON output, mirroring the format provided below, devoid of any textual AI response:

// 1. **Introduction**:
//    - Utilize the video title, description, and transcript to craft an engaging introduction, focusing primarily on overviewing the video content. Mentioning the title and creator can be included if it enhances the entertainment value.

// 2. **Topic Segmentation**:
//    - Segment topics based on the video's context and content, ensuring all content is covered. Summarize drawn-out parts through narration and showcase the most important/entertaining parts through highlights. COVER ALL TOPICS in the video even if it doesnt save on full playtime of the output versus the original video!!
// import { summarizeYouTubeTranscriptUsingClaudeassummarize } from '@/src/third-party-api/summaryUtils';

// 3. **Clip Selection**:
//    - Select highlight clips based on their informativeness and entertainment value including moments of insight, humor, and emotional intensity. Ensure clip duration is long enough to prevent a rapid bounce between topics.

// 4. **Narration Style**:
//    - Adopt a conversational tone, mirroring the style, tone, and context clues present in the video content to create a coherent and engaging narrative.

// 5. **Transitioning**:
//    - Handle transitions between narration and clips naturally, introducing clips especially when there's a shift in content, ensuring a smooth segue if necessary.

// 6. **Ending**:
//    - Mirror the content's closing or provide a brief overview of the topics covered, whichever is more fitting based on the video content.

// 7. **Error Handling**:
//    - In case of unclear or missing sections in the transcript, glaze over them, or play them live especially if it seems like something the viewer might understand.

// 8. **Additional Context**:
//    - Stick to the information provided in the video content, avoiding the introduction of external information unless it's crucial for narrating highlights.

// 9. **Visual Elements**:
//    - Avoid including additional visual elements like captions or overlays.

// 10. **Clip Descriptions**:
//     - Ensure descriptions mirror the segue or content preceding the clip, maintaining a coherent flow.

// 11. **Clip Durations**:
//     - The input video transcript is provide in json format which includes startMs, endMs, and transcript text between those timestamps. When determining highlight clips it is bound by these clips as a minimum unit, but these transcript segments could be random so highlight clips should most always be much longer than the transcript segments which are just generated from autogenerated speech to text transcription.

// 12. **Clip Durations Timestamps**:
//     - Make sure to pay special attention to the timestamps of the highlight clips and make sure they are the right units (milliseconds). They should mirror the units provided by the video transcript. Especially pay attention to the end ms that is literally when the clip will stop being played. When combining transcript segments into a highlight slip the startMs should be the startMs of the first transcript segment and the endMS should be the endMs of the last transcript segment.

// 13. **Customizability**:
//     - Do not provide customization options for end users in terms of clip selection or level of summarization at this moment.

// 14. **External References**:
//     - Do not reference external sources or information outside the provided video transcript and description.

// Now, based on the provided video information enclosed within the XML tags, generate a narrated summary and highlight reel script. Your response should be a vanilla JSON output, mirroring the format provided below, devoid of any textual AI response:

// [
//   {
//     "type": "narration",
//     "text": "<AI narrated text summarizing video parts and segueing smoothly between highlights>"
//   },
//   {
//     "type": "clip",
//     "startMs": <start milliseconds>,
//     "endMs": <end milliseconds>,
//     "text": "[<AI description of highlight clip>]"
//   }
//   ...
// ]
// `
const SYSTEM_PROMPT = `
1. Who are you?
Envision yourself as an AI host for a Video Summarizer Show, crafted to condense a input video into engaging narratives interweaved with video clips, employing the Chain of Density (CoD) summarization approach.
Your mission is to save viewers time by covering most all of the topics from the video while condensing less significant or repetitive parts with engaging narration.

2. General Summarization Strategy:
As you dissect the video transcript, identify key topics, speakers, and highlights. Break the transcript into logical segments of narration segments and video clip segments.
Use narration segments to summarize drawn-out parts with clear and concise narration segments.
Selecting video clips that encapsulate the most informative or entertaining segments.
Each segment should have narrated segues to seamlessly transition from narration segments to video clip segments, maintaining a coherent narrative that walks the viewer through the video topics.

3. Summary Show Output Main Sections:
Initiate the highlight reel show with a narrated introduction, setting the stage for what the viewer is about to experience.
Proceed with narration and video clip segments in chronological order, while also ensuring a fluid transition between segments.
Finally, at the end sign out with a summary of the topics covered in the video.

4. Video Information:
Utilize the video title, description, and transcript (provided by transcript chunks) to craft an engaging introduction, focusing primarily on overviewing the video content.
Mentioning the title and creator can be included if it enhances the entertainment value.

5. Topic Segmentation:
Segment topics based on the video's context and transcript content, ensuring all content is covered by the output.
Your output should segmented into into logical and chronological sections of narration segments and video clip segments.
Summarize drawn-out parts of the video content through narration and showcase the most important/entertaining parts through highlights.
Make sure to segue between narrated segments and highlight segments.
COVER ALL TOPICS in the video even if it doesnt save on full playtime of the output versus the original video!!

6. Narration Segment Style:
Adopt a conversational tone, mirroring the style, tone, and context clues present in the video content to create a coherent and engaging narrative.

7. Video Clip Selection (for Segments):
Select video clips based on their informativeness and entertainment value including moments of insight, depth of knowledge, quotables, entertainment, humor, and/or emotional intensity.
Ensure clip duration is long and dont cut off too sharply. When it doubt run the highlight segments long as the user is most interested in the actual clip content.
Avoid any advertising content like sponsors and other paid content in the video that is off topic from the rest of the video content unless it is truly part of the video content.

8. Video Clip Durations:
The input video transcript is segmented and each transcript segment includes startMs (start milliseconds), endMs (end milliseconds), and transcript text between those timestamps.
When determining video clips use transcript segments as a minimum unit, but remember these transcript segments are segmented by a speech to text transcriber (not based on content) so highlight clips should always be much longer than the transcript segments which are just generated from autogenerated speech to text transcription.

9. Video Clip Durations Timestamps:
Make sure to pay special attention determining the timestamps in the output you generate for video clips and make sure they in milliseconds.
They should mirror the units provided by the video transcript chunks. Especially pay attention to the endMs (end milliseconds) that is literally when the clip will stop being played.
When combining transcript segments into a highlight video clip (to be played to the user) the startMs should be the startMs of the first transcript chunk and the endMS should be the endMs of the last transcript chunk to ensure that the full video content intended to be covered by the highlight clip is played.

10. Video Clip Descriptions:
Ensure descriptions mirror content within the clip, maintaining a coherent flow.

11. Transitioning:
Handle transitions between narration and clips naturally, introducing clips especially when there's a shift in content, ensuring a smooth segue between narration segments and video clip segments.

12. Ending:
Mirror the content's closing or provide a brief overview of the topics covered, whichever is more fitting based on the video content.

13. Error Handling:
In case of unclear or missing sections in the transcript, glaze over them, or play them live especially if it seems like something the viewer might understand.

14. Additional Context:
Stick to the information provided in the video content, avoiding the introduction of external information unless it's crucial for narrating highlights.
Also since the transcript is provided by a speech to text recognizer, consider the transcript could be inaccurate sometimes.

15. Customizability:
Do not provide customization options for end users in terms of clip selection or level of summarization at this moment.

16. External References:
Do not reference external sources or information outside the provided video transcript and description.

Now, based on the video information provided below, generate a script for the Highlight Reel Show. Your response should be a vanilla JSON output, mirroring the format provided below, devoid of any textual AI response:
`
// TODO:::::
// [VIDEO TITLE]:
// {video title}
// [VIDEO DESCRIPTION]:
// {video description}

const PROMPT = `
Video information:
[VIDEO TRANSCRIPT CHUNKS]:
{video transcript}

Now, based on the provided video information provided, generate a narrated summary and highlight reel script. Your response should be a vanilla JSON output, mirroring the format provided below, devoid of any textual AI response in the following format.
[JSON OUTPUT FORMAT EXAMPLE]:
{
  output: [
    {
      "type": "narration",
      "text": "<AI narrated text summarizing video parts and segueing smoothly between highlights>"
    },
    {
      "type": "clip",
      "startMs": <start milliseconds>,
      "endMs": <end milliseconds>,
      "text": "[<AI description of highlight clip>]"
    }
    ...
  ]
}
`

export function getPrompt(transcript: YouTubeTranscript): string {
  console.log("getPrompt", typeof transcript)
  console.log("getPrompt", typeof transcript)
  console.log("getPrompt", typeof transcript)
  const transcriptTxt = transcript.reduce(
    (txt, segment) =>
      txt +
      `startMs: ${segment.startMs} endMs: ${segment.endMs} transcript: ${segment.text}\n`,
    "",
  )
  return PROMPT.replace("{video transcript}", transcriptTxt)
}

// Step 1: Summarize the transcript using LangChain
// async function summarizeTranscript(transcript: YouTubeTranscript): Promise<string> {
//   // Combine transcript segments into a single string
//   const fullTranscript = transcript.map((segment) => segment.text).join(" ")
//   const loader = new WebBaseLoader(fullTranscript) // This part may need to be adapted for TypeScript/your environment
//   const docs = loader.load()
//   const llm = new ChatOpenAI({ temperature: 0, model_name: "gpt-3.5-turbo-16k" })
//   const chain = load_summarize_chain(llm, { chain_type: "stuff" }) // Chain type and other parameters may need to be adjusted
//   const summary = await chain.run(docs)
//   return summary
// }

// Step 2: Generate Highlight Reel Script with OpenAI
// async function generateHighlightReelScript(summary: string): Promise<string> {
//   const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
//   const prompt = `${PROMPT} ${summary}`
//   const response = await openai.completions({ prompt: prompt })
//   const highlightReelScript = response.choices[0].text.trim()
//   return highlightReelScript
// }

// Execute the steps
// export default async function transcriptSummarizer1(transcript: YouTubeTranscript) {
//   const summarizedTranscript = await summarizeTranscript(transcript)
//   const highlightReelScript = await generateHighlightReelScript(summarizedTranscript)

//   console.log(highlightReelScript) // Output or use the generated highlight reel script
//   return highlightReelScript
// }

// export async function summarizeYouTubeTranscriptUsingOpenAIVector(
//   videoId: string,
//   transcript: YouTubeTranscript,
// ) {
//   // 5. Initialize the OpenAI model with an empty configuration object
//   const model = new LangOpenAI({}, { apiKey: OPENAI_API_KEY })

//   // 6. Check if the vector store file exists
//   const vectorStorePath = path.resolve(
//     __dirname,
//     "__vector_storage__",
//     `${videoId}.index`,
//   )
//   let vectorStore

//   if (existsSync(vectorStorePath)) {
//     // 6.1. If the vector store file exists, load it into memory
//     console.log("Vector Exists..")
//     vectorStore = await HNSWLib.load(vectorStorePath, new OpenAIEmbeddings())
//   } else {
//     // 6.2. If the vector store file doesn't exist, create it
//     // 6.2.1. Read the input text file
//     const transcriptTxt = transcript.reduce(
//       (txt, segment) => txt + `${segment.startTimestamp} ${segment.text}\n`,
//       "",
//     )
//     // 6.2.2. Create a RecursiveCharacterTextSplitter with a specified chunk size
//     const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
//     // 6.2.3. Split the input text into documents
//     const docs = await textSplitter.createDocuments([transcriptTxt])
//     // 6.2.4. Create a new vector store from the documents using OpenAIEmbeddings
//     vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings())
//     // 6.2.5. Save the vector store to a file
//     await vectorStore.save(vectorStorePath)
//   }

//   // 7. Create a RetrievalQAChain by passing the initialized OpenAI model and the vector store retriever
//   const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever())

//   // 8. Call the RetrievalQAChain with the input question, and store the result in the 'res' variable
//   const res = await chain.call({
//     query: PROMPT,
//   })

//   // 9. Log the result to the console
//   console.log({ res })
// }

export type Summary = SummarySegment[]
export type SummaryNarrationSegment = {
  type: "narration"
  text: string
}
export type SummaryClipSegment = {
  type: "clip"
  startMs: number
  endMs: number
  text: string
}
export type SummarySegment = SummaryNarrationSegment | SummaryClipSegment

export async function summarizeYouTubeTranscriptUsingClaudeSDK(
  transcript: YouTubeTranscript,
): Promise<Summary> {
  const prompt = getPrompt(transcript)
  const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY })
  try {
    const messages: Array<MessageParam> = [
      { role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` },
    ]
    const message = await anthropic.messages.create({
      max_tokens: 4096,
      messages,
      model: CLAUDE_MODEL,
    })
    console.log(messages)
    console.log(message)
    return JSON.parse(message.content[0].text.replace(/[\s\S]*?\n\{/, "{") as string)
      .output
  } catch (err) {
    console.error(prompt, err)
    return []
  }
}

export async function summarizeYouTubeTranscriptUsingClaudeSDKStream(
  transcript: YouTubeTranscript,
): Promise<AnthropicStream<Anthropic.Messages.MessageStreamEvent>> {
  console.log("summarizeYouTubeTranscriptUsingClaudeSDKStream")
  const prompt = getPrompt(transcript)
  const anthropic = new Anthropic({ apiKey: CLAUDE_API_KEY })
  try {
    const messages: Array<MessageParam> = [
      { role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` },
    ]
    const stream = await anthropic.messages.create({
      max_tokens: 4096,
      messages,
      model: CLAUDE_MODEL,
      stream: true,
    })

    return stream
  } catch (err) {
    throw err
  }
}

export async function summarizeYouTubeTranscriptUsingChatGPT(
  transcript: YouTubeTranscript,
): Promise<Summary> {
  const prompt = getPrompt(transcript)
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
  const isPreviewModel = OPENAI_MODEL.includes("-preview")
  const messages: Array<ChatCompletionMessageParam> = isPreviewModel
    ? [{ role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` }]
    : [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ]
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages,
  })

  console.log("COMPLETION", prompt, completion)
  const parsed = JSON.parse(completion.choices[0].message.content as string)
  const [key] = Object.keys(parsed)
  console.log("PARSED!", key, parsed)
  return parsed[key] as Summary
}

export async function summarizeYouTubeTranscriptUsingChatGPTStream(
  transcript: YouTubeTranscript,
): Promise<OpenAIStream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  console.log("summarizeYouTubeTranscriptUsingChatGPTStream")
  const prompt = getPrompt(transcript)
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })
  const isPreviewModel = OPENAI_MODEL.includes("-preview")
  const messages: Array<ChatCompletionMessageParam> = isPreviewModel
    ? [{ role: "user", content: `${SYSTEM_PROMPT}\n\n${prompt}` }]
    : [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ]
  const options: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming> =
    isPreviewModel
      ? {}
      : {
          response_format: { type: "json_object" },
        }
  const stream = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: messages,
    stream: true,
  })
  return stream
}
