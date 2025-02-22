import { Subject } from "rxjs"
import jsonParserStream from "../jsonParserStream"

describe("jsonParserStream", () => {
  it("should parse and emit json array items", async () => {
    const source = new Subject<string>()
    const parser = jsonParserStream<{}>(source)

    const results: Array<{}> = []

    const parserPromise = new Promise<void>((resolve, reject) => {
      parser.subscribe({
        next: (item) => {
          results.push(item)
        },
        error: reject,
        complete: resolve,
      })
    })

    source.next('[{ "foo": 1 }')
    source.next(',{ "foo')
    source.next('": 2 },')
    source.next('{ "foo": 3 }')
    source.next("]")
    source.complete()

    await parserPromise

    expect(results).toMatchInlineSnapshot(`
      [
        {
          "foo": 1,
        },
        {
          "foo": 2,
        },
        {
          "foo": 3,
        },
      ]
    `)
  })
})
