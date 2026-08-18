import type { TimelinePoint } from '@/features/typing'

export interface ChartPoint {
  x: number
  y: number
  value: number
  second: number
}

export interface ChartGeometry {
  width: number
  height: number
  /** Net speed line. */
  wpm: ChartPoint[]
  /** Gross speed line. */
  raw: ChartPoint[]
  /** One marker per second that contained mistakes. */
  errors: ChartPoint[]
  /** Upper bound of the value axis, rounded to a friendly number. */
  maxValue: number
  /** Horizontal grid lines, from top to bottom. */
  gridLines: Array<{ y: number; value: number }>
  lastSecond: number
}

export interface ChartOptions {
  width: number
  height: number
  /** Space reserved so strokes and markers are not clipped. */
  padding?: number
  gridSteps?: number
}

/** Rounds up to the next multiple of `step` so the axis ends on a round number. */
const roundUpTo = (value: number, step: number): number => Math.ceil(value / step) * step

const toPath = (points: readonly ChartPoint[]): string =>
  points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ')

/**
 * Maps a result timeline onto SVG coordinates.
 *
 * Kept free of React so the layout can be verified in isolation; the chart
 * component only turns these numbers into elements.
 */
export const buildChartGeometry = (
  timeline: readonly TimelinePoint[],
  { width, height, padding = 8, gridSteps = 4 }: ChartOptions,
): ChartGeometry => {
  const lastSecond = timeline.at(-1)?.second ?? 1
  const peak = Math.max(10, ...timeline.map((point) => Math.max(point.wpm, point.raw)))
  const maxValue = roundUpTo(peak, 20)

  const innerWidth = Math.max(1, width - padding * 2)
  const innerHeight = Math.max(1, height - padding * 2)
  const span = Math.max(1, lastSecond - 1)

  const toPoint = (point: TimelinePoint, value: number): ChartPoint => ({
    x: padding + ((point.second - 1) / span) * innerWidth,
    y: padding + (1 - value / maxValue) * innerHeight,
    value,
    second: point.second,
  })

  return {
    width,
    height,
    wpm: timeline.map((point) => toPoint(point, point.wpm)),
    raw: timeline.map((point) => toPoint(point, point.raw)),
    errors: timeline
      .filter((point) => point.errors > 0)
      .map((point) => toPoint(point, Math.max(point.wpm, point.raw))),
    maxValue,
    gridLines: Array.from({ length: gridSteps + 1 }, (_, index) => ({
      y: padding + (index / gridSteps) * innerHeight,
      value: Math.round(maxValue * (1 - index / gridSteps)),
    })),
    lastSecond,
  }
}

export const chartPath = toPath

/** Closes a line down to the baseline so it can be filled as an area. */
export const chartAreaPath = (
  points: readonly ChartPoint[],
  height: number,
  padding = 8,
): string => {
  if (points.length === 0) return ''
  const first = points[0]!
  const last = points.at(-1)!
  const baseline = height - padding

  return `${toPath(points)} L${last.x.toFixed(2)} ${baseline.toFixed(2)} L${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`
}
