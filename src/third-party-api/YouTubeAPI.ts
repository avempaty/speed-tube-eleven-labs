import ApiClient, { ExtendedRequestInit, GetRequestInit } from "simple-api-client"
import AppError from "../common/AppError"
import fetchAndMatch from "../common/fetchAndMatch"
import { CookieJar } from "tough-cookie"
import memo from "memoize-concurrent"

class YouTubeError extends AppError {}

export type Options = {
  apiKey: string
}

export enum YouTubeCaptionFormat {
  SBV = "sbv", // – SubViewer subtitle
  SCC = "scc", // – Scenarist Closed Caption format
  SRT = "srt", // – SubRip subtitle
  TTML = "ttml", // – Timed Text Markup Language caption
  VTT = "vtt", // – Web Video Text Tracks caption
}

export class YouTubeV3 extends ApiClient {
  private apiKey: string

  constructor({ apiKey }: Options) {
    super("https://www.googleapis.com/youtube/v3/", {
      headers: {
        "X-goog-api-key": apiKey,
      },
    })
    this.apiKey = apiKey
  }

  getTranscript = async (
    id: string,
    params?: { format: YouTubeCaptionFormat; language: string },
  ) => {
    const { format: tfmt, language: tlang } = params ?? {}
    const response = await this.get<{ tfmt?: YouTubeCaptionFormat; tlang?: string }>(
      `captions/${id}`,
      {
        query: {
          tfmt,
          tlang,
        },
      },
    )
    return response
  }
}

export class YouTubeV1 extends ApiClient {
  // private apiKey: string

  constructor(getInit?: GetRequestInit<{}, {}>) {
    // constructor({ apiKey }: Options) {
    // https://www.youtube.com/youtubei/v1/get_transcript?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false
    super("https://www.youtube.com/youtubei/v1/", getInit)
  }

  static parseTranscript(ytTranscript: YoutubeTranscriptResponse): YouTubeTranscript {
    try {
      return (
        ytTranscript.actions[0].updateEngagementPanelAction.content.transcriptRenderer.content.transcriptSearchPanelRenderer.body.transcriptSegmentListRenderer.initialSegments
          // TODO: parse transcriptSectionHeaderRenderer for length and title?
          .filter(
            (ytTranscriptSegment) =>
              ytTranscriptSegment.transcriptSegmentRenderer != null,
          )
          .map((ytTranscriptSegment) => ({
            text: ytTranscriptSegment.transcriptSegmentRenderer.snippet.runs
              .map((run) => run.text)
              .join(""),
            startTimestamp:
              ytTranscriptSegment.transcriptSegmentRenderer.startTimeText.simpleText,
            startMs: parseInt(ytTranscriptSegment.transcriptSegmentRenderer.startMs, 10),
            endMs: parseInt(ytTranscriptSegment.transcriptSegmentRenderer.endMs, 10),
          }))
      )
    } catch (err) {
      console.error(err)
      // @ts-ignore
      throw new YouTubeError("failed to parse transcript", { code: 500, ytTranscript })
    }
  }

  // if this ever breaks checkout https://github.com/Kakulukian/youtube-transcript
  static scrapeTranscript = memo(async (videoId: string) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const { match, res } = await fetchAndMatch(
      200,
      videoUrl,
      /"INNERTUBE_API_KEY":"([^"]+)".*"INNERTUBE_CONTEXT":({.*}),"INNER.*"getTranscriptEndpoint":{"params":"([^"]+)"}/s,
    )

    if (match == null) {
      throw new YouTubeError("no innertubeApiKey found")
    }

    const cookies = res.headers["set-cookie"]
      ? Array.isArray(res.headers["set-cookie"])
        ? res.headers["set-cookie"]
        : [res.headers["set-cookie"]]
      : []
    const cookieJar = new CookieJar()

    // parse cookies
    cookies.forEach((cookie) => cookieJar.setCookieSync(cookie, videoUrl))

    const client = new YouTubeV1((path, init) => {
      return {
        ...init,
        headers: {
          ...init?.headers,
          Cookie: cookieJar.getCookieStringSync(videoUrl),
        },
      }
    })
    // const client = new YouTubeV1({ apiKey: match[1] })
    const innertubeApiKey = match[1]
    const innertubeContext = JSON.parse(match[2])
    const innertubeParams = match[3]

    const ytTranscript = await client.getTranscript(videoId, {
      query: { key: innertubeApiKey, prettyPrint: "false" },
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "sec-ch-ua": '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
        "sec-ch-ua-arch": '"arm"',
        "sec-ch-ua-bitness": '"64"',
        "sec-ch-ua-full-version": '"115.0.5790.170"',
        "sec-ch-ua-full-version-list":
          '"Not/A)Brand";v="99.0.0.0", "Google Chrome";v="115.0.5790.170", "Chromium";v="115.0.5790.170"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-model": '""',
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"14.0.0"',
        "sec-ch-ua-wow64": "?0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "same-origin",
        "sec-fetch-site": "same-origin",
        "x-goog-visitor-id": innertubeContext.client.visitorData,
        "x-youtube-bootstrap-logged-in": "false",
        "x-youtube-client-name": "1",
        "x-youtube-client-version": "2.20231003.02.02",
        Referer: videoUrl,
        "Referrer-Policy": "origin-when-cross-origin",
      },
      json: {
        context: innertubeContext,
        params: innertubeParams,
      },
    })

    const parsed = YouTubeV1.parseTranscript(ytTranscript)
    // transcriptSummarizer(videoId, parsed)
    return parsed
  })

  getTranscript = async (
    videoId: string,
    init: ExtendedRequestInit<
      { key: string; prettyPrint?: string },
      { context: {}; params: string }
    >,
  ) => {
    const response: YoutubeTranscriptResponse = await this.post<
      { context: {}; params: string },
      { key: string }
    >(`get_transcript`, {
      ...(init ?? {}),
      method: "POST",
    })
    return response
  }
}

interface YoutubeTranscriptResponse {
  actions: [
    {
      updateEngagementPanelAction: {
        content: {
          transcriptRenderer: {
            content: {
              transcriptSearchPanelRenderer: {
                body: {
                  transcriptSegmentListRenderer: {
                    initialSegments: {
                      transcriptSegmentRenderer: {
                        accessibility: {
                          accessibilityData: {
                            label: string
                          }
                        }
                        endMs: string
                        snippet: {
                          runs: {
                            text: string
                          }[]
                        }
                        startMs: string
                        startTimeText: {
                          simpleText: string
                        }
                        targetId: string
                        trackingParams: string
                      }
                    }[]
                    noResultLabel: {
                      runs: {
                        text: string
                      }[]
                    }
                    retryLabel: {
                      runs: {
                        text: string
                      }[]
                    }
                    touchCaptionsEnabled: boolean
                  }
                }
                footer: {
                  transcriptFooterRenderer: {
                    languageMenu: {
                      sortFilterSubMenuRenderer: {
                        subMenuItems: {
                          continuation: {
                            reloadContinuationData: {
                              clickTrackingParams: string
                              continuation: string
                            }
                          }
                          selected: boolean
                          title: string
                          trackingParams: string
                        }[]
                        trackingParams: string
                      }
                    }
                  }
                }
                targetId: string
                trackingParams: string
              }
            }
            trackingParams: string
          }
        }
      }
    },
  ]
  responseContext: {
    mainAppWebResponseContext: {
      loggedOut: boolean
      trackingParam: string
    }
    serviceTrackingParams: {
      params: {
        key: string
        value: string
      }[]
      service: string
    }[]
    webResponseContextExtensionData: {
      hasDecorated: boolean
    }
  }
  trackingParams: string
}

export type YouTubeTranscriptSegment = {
  text: string
  startTimestamp: string
  startMs: number
  endMs: number
}
export type YouTubeTranscript = Array<YouTubeTranscriptSegment>
