import { Transform, TransformCallback, TransformOptions } from "stream"

export default class RegexpTransform extends Transform {
  private regex: RegExp
  private remaining: string

  constructor(regex: RegExp, opts?: TransformOptions) {
    super({ ...opts, objectMode: true })
    this.regex = regex
    this.remaining = ""
  }

  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback) {
    const str = this.remaining + chunk.toString()
    const result = str.match(this.regex)

    if (result) {
      this.push(result) // Assume the URL is captured in the first capturing group
      callback(null)
    } else {
      this.remaining = str
      callback(null)
    }
  }
}
