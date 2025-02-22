export default function concatStringStream(
  cb: (text: string) => void,
): WritableStream<string> {
  let result = ""

  return new WritableStream<string>({
    abort(reason?: any) {
      result = ""
    },
    write(chunk) {
      result += chunk.toString()
    },
    close() {
      cb(result)
    },
  })
}
