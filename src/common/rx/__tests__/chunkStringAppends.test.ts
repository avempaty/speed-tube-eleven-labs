import { Subject } from "rxjs"
import chunkStringAppends from "../chunkStringAppends"

describe("chunkStringAppends", () => {
  it("should appends not emit anything if the string remains unchanged", () => {
    const subject = new Subject<string>()
    const result: string[] = []

    subject.pipe(chunkStringAppends).subscribe((chunk) => {
      result.push(chunk)
    })

    subject.next("hello")
    subject.next("hello")
    subject.next("hello")

    expect(result).toMatchInlineSnapshot(`
      [
        "hello",
      ]
    `)
  })

  it("should emit emit string appends as chunks if the string grows", () => {
    const subject = new Subject<string>()
    const result: string[] = []

    subject.pipe(chunkStringAppends).subscribe((chunk) => {
      result.push(chunk)
    })

    subject.next("foo")
    subject.next("foobar")
    subject.next("foobarqux")

    expect(result).toMatchInlineSnapshot(`
      [
        "foo",
        "bar",
        "qux",
      ]
    `)
  })
})
