/** @jest-environment setup-polly-jest/jest-environment-node */

import fetchAndMatch from "../fetchAndMatch"
import setupPollyNode from "../test/setupPollyNode"

describe("fetchAndMatch", () => {
  let context = setupPollyNode(__dirname)

  it("should stream http response and match regexp", async () => {
    context.polly.configure({
      recordIfMissing: true,
    })

    const { match, res } = await fetchAndMatch(
      200,
      "https://www.youtube.com/watch?v=DR_yTQ0SYVA",
      /"INNERTUBE_API_KEY":"([^"]+)".*"INNERTUBE_CONTEXT":({.*}),"INNER.*"getTranscriptEndpoint":{"params":"([^"]+)"}/s,
    )

    expect(match).toBeDefined()
    expect(match?.slice(1)).toMatchInlineSnapshot(`
      [
        "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
        "{"client":{"hl":"en","gl":"US","remoteHost":"73.158.73.108","deviceMake":"","deviceModel":"","visitorData":"CgtKaU52YUxOZkxyQSiWkImpBjIICgJVUxICGgA%3D","userAgent":"gzip(gfe)","clientName":"WEB","clientVersion":"2.20231003.02.02","osVersion":"","originalUrl":"https://www.youtube.com/watch?v\\u003dDR_yTQ0SYVA","platform":"DESKTOP","clientFormFactor":"UNKNOWN_FORM_FACTOR","configInfo":{"appInstallData":"CJaQiakGENfprwUQiOOvBRDnuq8FEOLUrgUQ26-vBRDqw68FEKT4rwUQ6ej-EhDd6P4SEOSz_hIQ7qKvBRCst68FEKfq_hIQuPuvBRC1pq8FEK76rwUQvOuvBRC0ya8FEPP_rwUQ6-j-EhCl7P4SENnurwUQ0-GvBRCa8K8FEI75rwUQqfevBRD1-a8FEOPyrwUQzN-uBRDB6q8FEMyu_hIQ8qivBRCJ6K4FEMX7rwUQu_mvBRCe468FEJfn_hIQvbauBRDC968FELiLrgUQ29ivBRClwv4SEKf3rwUQ1eWvBRDZya8FEL35rwUQ1KGvBRD6vq8FELXnrwUQ2oCwBRDQ5a8FEPCjrwUQn_T-Eg%3D%3D"},"userInterfaceTheme":"USER_INTERFACE_THEME_LIGHT","deviceExperimentId":"ChxOekk0TnpRMk5qUXdOelk1TVRneU16azJOQT09EJaQiakGGJaQiakG"},"user":{"lockedSafetyMode":false},"request":{"useSsl":true},"clickTracking":{"clickTrackingParams":"IhMIgfDsw+XlgQMVwVdMCB1k9Ake"}}",
        "CgtEUl95VFEwU1lWQRISQ2dOaGMzSVNBbVZ1R2dBJTNEGAEqM2VuZ2FnZW1lbnQtcGFuZWwtc2VhcmNoYWJsZS10cmFuc2NyaXB0LXNlYXJjaC1wYW5lbDABOAFAAQ%3D%3D",
      ]
    `)
  })
})
