import { filter, map, pipe, scan } from "rxjs"

export default function trimBefore(delimeter: string) {
  type AccType = { trimmed: boolean; buffer: string; chunk: string }
  return pipe(
    scan<string, AccType>(
      (acc, current) => {
        // string already trimmed, just passthrough chunks
        if (acc.trimmed) return { ...acc, chunk: current }

        const buffer = acc.buffer + current
        const delimeterIndex = buffer.indexOf(delimeter)

        if (delimeterIndex === -1) {
          // keep buffering
          return { ...acc, buffer }
        }

        // found delimeter, trim buffer and start passing through chunks
        const chunk = buffer.slice(delimeterIndex)

        return { trimmed: true, buffer: "", chunk }
      },
      {
        trimmed: false,
        buffer: "",
        chunk: "",
      },
    ),
    map((acc) => acc.chunk),
    filter((chunk) => chunk.length > 0),
  )
}
