import { IncomingMessage } from "http"
import AppError from "./AppError"
import https from "https"
import RegexpTransform from "./RegExpTransform"
import pick from "lodash.pick"

class FetchAndMatchError extends AppError {}

export default async function fetchAndMatch(
  expectedStatusCode: number,
  url: string,
  re: RegExp,
): Promise<{ match: RegExpMatchArray | null; res: IncomingMessage }> {
  return new Promise((resolve, reject) => {
    let regexpMatchFound = false
    const rejectWithError = (
      status: number,
      message: string,
      { err, res }: { err?: Error; res?: IncomingMessage } = {},
    ) => {
      if (err != null) {
        reject(
          FetchAndMatchError.wrapWithCode(err, status, message, {
            url,
            res: res ? pick(res, ["statusCode", "headers"]) : undefined,
          }),
        )
      }

      reject(
        FetchAndMatchError.createFromCode(status, message, {
          url,
          res: res ? pick(res, ["statusCode", "headers"]) : undefined,
        }),
      )
    }

    https
      .get(url, (res) => {
        if (res.statusCode !== expectedStatusCode) {
          // TODO: should i destroy or resume?
          res.resume() // Consume response data to free up memory
          let statusCode = res.statusCode === 500 ? 503 : res.statusCode
          rejectWithError(statusCode ?? 503, "unexpected status code", { res })
          return
        }

        const regexpTransform = new RegexpTransform(re)
        res.pipe(regexpTransform)

        res.on("error", (err) => {
          rejectWithError(503, "response error", { err, res })
        })

        regexpTransform.on("data", (match: RegExpMatchArray) => {
          regexpMatchFound = true
          resolve({ match, res })
          res.unpipe(regexpTransform)
          res.destroy()
        })

        regexpTransform.on("end", () => {
          if (regexpMatchFound) return
          resolve({ res, match: null })
        })

        regexpTransform.on("error", (err) => {
          // should not happen
          rejectWithError(500, "regexp transform error", { err, res })
        })
      })
      .on("error", (err) => {
        rejectWithError(504, "failed to fetch video url", { err })
      })
  })
}
