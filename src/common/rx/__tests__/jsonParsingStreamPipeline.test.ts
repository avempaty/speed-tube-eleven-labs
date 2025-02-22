import { Subject } from "rxjs"
import chunkStringAppends from "../chunkStringAppends"
import trimBefore from "../trimBefore"
import jsonParserStream from "../jsonParserStream"
// @ts-ignore
// import cached from "../../../../app/api/summarize/[videoId]/cached.txt"
const cached = ""

describe.skip("json parsing stream pipeline", () => {
  it("should test the whole stream pipeline", async () => {
    const completionStream = new Subject<string>()

    const source = completionStream.pipe(chunkStringAppends).pipe(trimBefore("["))
    const parser = jsonParserStream<{}>(source)

    const results: Array<{}> = []
    const promise = new Promise<void>((resolve, reject) => {
      parser.subscribe({
        next: (chunk) => {
          results.push(chunk)
        },
        error: reject,
        complete: resolve,
      })
    })

    completionStream.next("leading")
    completionStream.next("leadingtrash")
    completionStream.next("leadingtrash here you go:\n[")
    completionStream.next("leadingtrash here you go:\n[\n{")
    completionStream.next('leadingtrash here you go:\n[\n{ "foo')
    completionStream.next('leadingtrash here you go:\n[\n{ "foo": 1 }')
    completionStream.next('leadingtrash here you go:\n[\n{ "foo": 1 },')
    completionStream.next('leadingtrash here you go:\n[\n{ "foo": 1 },\n{ "ba')
    completionStream.next('leadingtrash here you go:\n[\n{ "foo": 1 },\n{ "bar":')
    completionStream.next('leadingtrash here you go:\n[\n{ "foo": 1 },\n{ "bar": 1 }')
    completionStream.next('leadingtrash here you go:\n[\n{ "foo": 1 },\n{ "bar": 1 }]')
    completionStream.complete()

    await promise
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "foo": 1,
        },
        {
          "bar": 1,
        },
      ]
    `)
  })

  it("should test the whole stream pipeline 2", async () => {
    const completionStream = new Subject<string>()

    const source = completionStream.pipe(chunkStringAppends).pipe(trimBefore("["))
    const parser = jsonParserStream<{}>(source)

    const results: Array<{}> = []
    const promise = new Promise<void>((resolve, reject) => {
      parser.subscribe({
        next: (chunk) => {
          results.push(chunk)
        },
        error: reject,
        complete: resolve,
      })
    })

    completionStream.next("Here")
    completionStream.next("Here is the narrated summary")
    completionStream.next("Here is the narrated summary an")
    completionStream.next("Here is the requested JSON format:")
    completionStream.next("Here is the requested JSON format:\n\n{")
    completionStream.next("Here is the requested JSON format:\n\n{\n  ")
    completionStream.next('Here is the requested JSON format:\n\n{\n  "')
    completionStream.next('Here is the requested JSON format:\n\n{\n  "output')
    completionStream.next('Here is the requested JSON format:\n\n{\n  "output":')
    completionStream.next('Here is the requested JSON format:\n\n{\n  "output": [')
    completionStream.next('Here is the requested JSON format:\n\n{\n  "output": [\n    ')
    completionStream.next('Here is the requested JSON format:\n\n{\n  "output": [\n    {')
    completionStream.next(
      'Here is the requested JSON format:\n\n{\n  "output": [\n    {\n      "type": "narration",\n      "text": "In this video',
    )
    completionStream.next(
      'Here is the requested JSON format:\n\n{\n  "output": [\n    {\n      "type": "narration",\n      "text": "In this video" }',
    )
    completionStream.next(
      'Here is the requested JSON format:\n\n{\n  "output": [\n    {\n      "type": "narration",\n      "text": "In this video" } ]',
    )
    completionStream.complete()

    await promise
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "text": "In this video",
          "type": "narration",
        },
      ]
    `)
  })
})

it.skip("should test the whole stream pipeline 2 from full text", async () => {
  const completionStream = new Subject<string>()

  const source = completionStream.pipe(chunkStringAppends).pipe(trimBefore("["))
  const parser = jsonParserStream<{}>(source)

  const results: Array<{}> = []
  const promise = new Promise<void>((resolve, reject) => {
    parser.subscribe({
      next: (chunk) => {
        results.push(chunk)
      },
      error: reject,
      complete: resolve,
    })
  })

  completionStream.next(cached)
  completionStream.complete()

  await promise
  expect(results).toMatchInlineSnapshot(`
      [
        {
          "text": "In this video",
          "type": "narration",
        },
      ]
    `)
})
