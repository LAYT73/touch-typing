import { describe, expect, it } from 'vitest'
import type { TimelinePoint } from '@/features/typing'
import { buildChartGeometry, chartPath } from './chartGeometry'

const timeline: TimelinePoint[] = [
  { second: 1, wpm: 40, raw: 48, errors: 0 },
  { second: 2, wpm: 55, raw: 60, errors: 2 },
  { second: 3, wpm: 62, raw: 70, errors: 0 },
]

const options = { width: 300, height: 100, padding: 10, gridSteps: 4 }

describe('buildChartGeometry', () => {
  it('spreads the samples across the full inner width', () => {
    const { wpm } = buildChartGeometry(timeline, options)

    expect(wpm[0]?.x).toBe(10)
    expect(wpm.at(-1)?.x).toBe(290)
  })

  it('rounds the value axis up to a friendly maximum', () => {
    expect(buildChartGeometry(timeline, options).maxValue).toBe(80)
  })

  it('puts higher speeds closer to the top', () => {
    const { wpm } = buildChartGeometry(timeline, options)

    expect(wpm[0]!.y).toBeGreaterThan(wpm.at(-1)!.y)
  })

  it('marks only the seconds that contained mistakes', () => {
    const { errors } = buildChartGeometry(timeline, options)

    expect(errors).toHaveLength(1)
    expect(errors[0]?.second).toBe(2)
  })

  it('builds one grid line per step, ending at zero', () => {
    const { gridLines } = buildChartGeometry(timeline, options)

    expect(gridLines).toHaveLength(5)
    expect(gridLines[0]?.value).toBe(80)
    expect(gridLines.at(-1)?.value).toBe(0)
  })

  it('keeps a single sample inside the chart area', () => {
    const { wpm } = buildChartGeometry([{ second: 1, wpm: 30, raw: 30, errors: 0 }], options)

    expect(wpm).toHaveLength(1)
    expect(wpm[0]?.x).toBe(10)
  })
})

describe('chartPath', () => {
  it('starts with a move command and continues with lines', () => {
    const { wpm } = buildChartGeometry(timeline, options)

    expect(chartPath(wpm)).toMatch(/^M10\.00 \d+\.\d+ L/)
  })

  it('is empty without points', () => {
    expect(chartPath([])).toBe('')
  })
})
