import { Subject } from "rxjs"
import trimBefore from "../trimBefore"

describe("trimBefore", () => {
  it("should trim nothing if the stream starts w/ delimeter", () => {
    const subject = new Subject<string>()
    const result: string[] = []

    subject.pipe(trimBefore("[")).subscribe((chunk) => {
      result.push(chunk)
    })

    subject.next("[")
    subject.next('"foo",')
    subject.next('"bar",')
    subject.next('"qux",')
    subject.next("hello")

    expect(result).toMatchInlineSnapshot(`
      [
        "[",
        ""foo",",
        ""bar",",
        ""qux",",
        "hello",
      ]
    `)
  })

  it("should trim nothing if the stream starts w/ delimeter one chunk", () => {
    const subject = new Subject<string>()
    const result: string[] = []

    subject.pipe(trimBefore("[")).subscribe((chunk) => {
      result.push(chunk)
    })

    subject.next(
      '[{"text":"so Tesla reported earnings today and","startTimestamp":"0:00","startMs":399,"endMs":2760}]',
    )

    expect(result).toMatchInlineSnapshot(`
      [
        "[{"text":"so Tesla reported earnings today and","startTimestamp":"0:00","startMs":399,"endMs":2760}]",
      ]
    `)
  })

  it("should trim a string string before delimeter", () => {
    const subject = new Subject<string>()
    const result: string[] = []

    subject.pipe(trimBefore("[")).subscribe((chunk) => {
      result.push(chunk)
    })

    subject.next("garbagejibberish junk P{ foo bar")
    subject.next("garbagejibberish junk P{ foo bar")
    subject.next("garbage[")
    subject.next('"foo",')
    subject.next('"bar",')
    subject.next('"qux",')
    subject.next("hello")

    expect(result).toMatchInlineSnapshot(`
      [
        "[",
        ""foo",",
        ""bar",",
        ""qux",",
        "hello",
      ]
    `)
  })
})
