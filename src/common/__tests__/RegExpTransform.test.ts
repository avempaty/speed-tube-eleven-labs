import { PassThrough } from "stream"
import RegExpTransform from "../RegExpTransform"
import { youtubeVideoHTML } from "./__fixtures__/youtubeVideoHTML"

describe("RegExpTransform", () => {
  it("should parse stream using regexp", async () => {
    const through = new PassThrough()
    const transform = new RegExpTransform(
      /"INNERTUBE_API_KEY":"([^"]+)".*"INNERTUBE_CONTEXT":({.*}),"INNER.*"getTranscriptEndpoint":{"params":"([^"]+)"}/s,
    )

    const match: RegExpMatchArray = await new Promise((resolve, reject) => {
      const stream = through.pipe(transform)
      stream.on("data", resolve)
      stream.on("end", () => reject(new Error("no match found")))
      stream.on("error", reject)
      through.write(youtubeVideoHTML)
      through.end()
    })

    expect(match).toBeDefined()
    expect(match).toBeInstanceOf(Array)
    expect(match.slice(1)).toMatchInlineSnapshot(`
      [
        "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
        "{"client":{"hl":"en","gl":"US","remoteHost":"73.158.73.108","deviceMake":"Robot","deviceModel":"Bot or Crawler","visitorData":"CgtFVEQxUWRvOEZJOCjpzvmoBjIICgJVUxICGgA%3D","userAgent":"curl/8.1.2,gzip(gfe)","clientName":"WEB","clientVersion":"2.20231003.02.00","osVersion":"","originalUrl":"https://www.youtube.com/watch?v=DR_yTQ0SYVA","platform":"DESKTOP","clientFormFactor":"UNKNOWN_FORM_FACTOR","configInfo":{"appInstallData":"COnO-agGEJfn_hIQqfevBRD1-a8FEI75rwUQzK7-EhDi1K4FEOno_hIQpuz-EhDC968FEL35rwUQ86ivBRDnuq8FEOrDrwUQ1-mvBRCJ6K4FEOvo_hIQ5LP-EhDUoa8FENPhrwUQ1eWvBRC0ya8FEKfq_hIQxfuvBRC4-68FEKf3rwUQzN-uBRDB6q8FEJrwrwUQpPivBRC4i64FELvSrwUQo96vBRDb2K8FEN3o_hIQ7qKvBRC1pq8FEKy3rwUQnuOvBRC3768FENnurwUQ-r6vBRC9tq4FELzrrwUQrvqvBRDbr68FEKXC_hIQ4_KvBRDZya8FEIjjrwUQ7OivBRD_168F"},"userInterfaceTheme":"USER_INTERFACE_THEME_LIGHT","acceptHeader":"*/*","deviceExperimentId":"ChxOekk0TmpNM05EazBPVGcyTnpNd09EazBPQT09EOnO-agGGOnO-agG"},"user":{"lockedSafetyMode":false},"request":{"useSsl":true},"clickTracking":{"clickTrackingParams":"IhMIjvyq67LegQMV+VdMCB20sQVt"}}",
        "CgtEUl95VFEwU1lWQRISQ2dOaGMzSVNBbVZ1R2dBJTNEGAEqM2VuZ2FnZW1lbnQtcGFuZWwtc2VhcmNoYWJsZS10cmFuc2NyaXB0LXNlYXJjaC1wYW5lbDABOAFAAQ%3D%3D",
      ]
    `)
  })
})
