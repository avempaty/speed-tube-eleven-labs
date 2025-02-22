export default function concatUTF8BufferStream(
  cb: (text: string) => void,
): WritableStream<Uint8Array> {
  let buffer: Uint8Array = new Uint8Array()

  return new WritableStream<Uint8Array>({
    abort(reason?: any) {
      buffer = new Uint8Array()
    },
    write(chunk) {
      buffer = new Uint8Array([...buffer, ...chunk])
    },
    close() {
      let str = ""
      try {
        str = new TextDecoder("utf-8").decode(buffer)
      } catch (e) {
        console.error(e)
      }
      cb(str)
    },
  })
}
