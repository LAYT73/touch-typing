/** Formats milliseconds as `m:ss` (or `s` when under a minute). */
export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : String(seconds)
}

export const msToSeconds = (ms: number): number => ms / 1000

export const msToMinutes = (ms: number): number => ms / 60_000
