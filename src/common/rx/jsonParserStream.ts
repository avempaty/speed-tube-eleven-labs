import { Observable, Subject } from "rxjs"
import JSONStream from "JSONStream"

export default function jsonParserStream<T>(source: Observable<string>): Observable<T> {
  const items = new Subject<T>()
  const stream = JSONStream.parse("*")

  source.subscribe({
    next: (chunk) => {
      stream.write(chunk)
    },
    error: (error) => {
      stream.emit("error", error)
    },
    complete: () => {
      stream.end()
    },
  })

  stream.on("data", (data) => {
    items.next(data)
  })
  stream.on("error", (error) => {
    items.error(error)
  })
  stream.on("end", () => {
    items.complete()
  })

  return items
}
