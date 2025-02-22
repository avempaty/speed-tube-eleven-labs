import { pipe, scan, map, filter } from "rxjs"

export default pipe(
  scan<string, { prev: string; current: string }>(
    (acc, current) => {
      // Use `scan` to remember the prev full string.
      return { prev: acc.current, current: current }
    },
    { prev: "", current: "" },
  ), // Initial state with empty strings.
  map(({ prev, current }) => {
    // Use `map` to calculate and return the new part of the string.
    if (prev === current) {
      return "" // No change in the string.
    }
    console.log(current, prev)
    return current.slice(prev.length) // Slice the new part out of the current string.
  }),
  filter((chunk) => chunk !== ""), // Filter out empty strings if there's no change.
)
