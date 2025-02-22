export async function cacheReadableStreamToDisk(
  id: string,
  readableStream: any,
): Promise<void> {
  const { Readable } = await import("node:stream")
  const { createWriteStream } = await import("node:fs")

  return new Promise((resolve, reject) => {
    const readable = Readable.fromWeb(readableStream)
    const writable = createWriteStream(`./cache/${id}.txt`)

    readable.on("error", reject)
    readable.pipe(writable).on("error", reject).on("finish", resolve)
  })
}

export async function readableStreamFromDisk(id: string): Promise<ReadableStream> {
  const { Readable } = await eval('import("node:stream")')
  const { createReadStream } = await eval('import("node:fs")')

  return Readable.toWeb(createReadStream(`./cache/${id}.txt`)) as ReadableStream<any>
}
