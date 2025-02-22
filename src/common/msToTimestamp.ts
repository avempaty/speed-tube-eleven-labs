export default function msToTimestamp(ms: number, roundUpToSeconds: boolean = true) {
  let hours = Math.floor(ms / (1000 * 60 * 60))
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let seconds = Math.floor((ms / 1000) % 60)
  let millis = ms % 1000

  if (roundUpToSeconds) {
    if (millis >= 500) {
      // Round up to the next second
      seconds += 1
      if (seconds === 60) {
        seconds = 0
        minutes += 1
        if (minutes === 60) {
          minutes = 0
          hours += 1
        }
      }
    }
  }

  let parts = [
    hours,
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ]

  if (hours === 0) {
    parts.shift() // Remove hours if it's 0
  }

  const timestampToSeconds = parts.join(":")

  if (roundUpToSeconds) {
    return timestampToSeconds
  }

  // timestampToMilliseconds
  return timestampToSeconds + "." + millis.toString().padStart(3, "0")
}
