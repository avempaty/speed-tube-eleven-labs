import JSONStream from "JSONStream"

describe("JSONStream", () => {
  // it should parse a json stream
  it("should parse a json stream", async () => {
    const stream = JSONStream.parse("*")
    const results: {}[] = []

    stream.on("data", (data) => {
      results.push(data)
    })
    const endPromise = new Promise<void>((resolve) => {
      stream.on("end", () => {
        resolve()
      })
    })

    stream.write('[{ "foo": 1 }')
    stream.write(',{ "foo": 2 },')
    stream.write('{ "foo": 3 }')
    stream.write("]")
    stream.end()

    await endPromise

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
  // it should parse a json stream with a path
  // it should parse a json stream with a path and a map function
})
