export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)

export const mean = (values: readonly number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

export const standardDeviation = (values: readonly number[]): number => {
  if (values.length < 2) return 0
  const average = mean(values)
  const variance = mean(values.map((value) => (value - average) ** 2))
  return Math.sqrt(variance)
}

export const roundTo = (value: number, decimals = 0): number => {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Safe ratio helper: returns 0 instead of NaN/Infinity when `total` is 0. */
export const ratio = (part: number, total: number): number => (total === 0 ? 0 : part / total)

export const percentage = (part: number, total: number, decimals = 0): number =>
  roundTo(ratio(part, total) * 100, decimals)
