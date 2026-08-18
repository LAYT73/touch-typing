import { describe, expect, it } from 'vitest'
import { createSessionState, sessionReducer } from './session'
import {
  buildTimeline,
  computeAccuracy,
  computeConsistency,
  computeResult,
  computeWpm,
  countCharacters,
} from './stats'
import type { Keystroke, SessionState } from './types'

const START = 10_000

/** Types `input`, spending `msPerKey` on every keystroke. */
const type = (state: SessionState, input: string, msPerKey = 100): SessionState =>
  [...input].reduce((current, char, index) => {
    const at = START + (index + 1) * msPerKey
    return char === ' '
      ? sessionReducer(current, { type: 'submitWord', at })
      : sessionReducer(current, { type: 'insert', char, at })
  }, state)

describe('countCharacters', () => {
  it('counts a perfectly typed text including the separating space', () => {
    const state = type(createSessionState(['ab', 'cd']), 'ab cd')

    expect(countCharacters(state)).toEqual({ correct: 5, incorrect: 0, extra: 0, missed: 0 })
  })

  it('separates incorrect, extra and missed characters', () => {
    // "abx" for "abc" -> one wrong char, plus the space; "c" for "cde" -> two missed chars.
    const state = type(createSessionState(['abc', 'cde']), 'abx c')
    const finished = sessionReducer(state, { type: 'submitWord', at: START + 900 })

    expect(countCharacters(finished)).toEqual({ correct: 4, incorrect: 1, extra: 0, missed: 2 })
  })

  it('counts characters typed beyond the expected word as extra', () => {
    const state = type(createSessionState(['ab', 'cd']), 'abzz')

    expect(countCharacters(state)).toMatchObject({ correct: 2, extra: 2 })
  })

  it('does not treat unwritten characters of the active word as missed', () => {
    const state = type(createSessionState(['abcd', 'ef']), 'ab')

    expect(countCharacters(state)).toEqual({ correct: 2, incorrect: 0, extra: 0, missed: 0 })
  })
})

describe('computeWpm', () => {
  it('treats five characters as one word', () => {
    expect(computeWpm(50, 60_000)).toBe(10)
    expect(computeWpm(50, 30_000)).toBe(20)
  })

  it('returns zero before any time has passed', () => {
    expect(computeWpm(10, 0)).toBe(0)
  })
})

describe('computeAccuracy', () => {
  it('is the share of keystrokes that were right the first time', () => {
    const keystrokes: Keystroke[] = [
      { at: 0, correct: true },
      { at: 1, correct: true },
      { at: 2, correct: false },
      { at: 3, correct: true },
    ]

    expect(computeAccuracy(keystrokes)).toBe(75)
  })

  it('is zero when nothing was typed', () => {
    expect(computeAccuracy([])).toBe(0)
  })
})

describe('buildTimeline', () => {
  const keystrokes: Keystroke[] = [
    { at: 100, correct: true },
    { at: 300, correct: true },
    { at: 700, correct: false },
    { at: 1_400, correct: true },
    { at: 1_800, correct: true },
  ]

  it('produces one sample per elapsed second', () => {
    const timeline = buildTimeline(keystrokes, 2_000)

    expect(timeline).toHaveLength(2)
    expect(timeline.map((point) => point.second)).toEqual([1, 2])
  })

  it('reports raw speed within the second and errors made in it', () => {
    const [first, second] = buildTimeline(keystrokes, 2_000)

    // 3 keystrokes in the first second -> (3 / 5) * 60 = 36 raw wpm
    expect(first).toMatchObject({ raw: 36, errors: 1 })
    expect(second).toMatchObject({ raw: 24, errors: 0 })
  })

  it('reports net speed accumulated since the start', () => {
    const [, second] = buildTimeline(keystrokes, 2_000)

    // 4 correct keystrokes after 2s -> (4 / 5) / (2 / 60) = 24 wpm
    expect(second?.wpm).toBe(24)
  })
})

describe('computeConsistency', () => {
  it('is 100% when every second has the same speed', () => {
    const timeline = [1, 2, 3].map((second) => ({ second, raw: 60, wpm: 60, errors: 0 }))

    expect(computeConsistency(timeline)).toBe(100)
  })

  it('drops as the speed fluctuates', () => {
    const steady = computeConsistency([
      { second: 1, raw: 55, wpm: 55, errors: 0 },
      { second: 2, raw: 60, wpm: 58, errors: 0 },
      { second: 3, raw: 58, wpm: 58, errors: 0 },
    ])
    const erratic = computeConsistency([
      { second: 1, raw: 10, wpm: 10, errors: 0 },
      { second: 2, raw: 90, wpm: 50, errors: 0 },
      { second: 3, raw: 20, wpm: 40, errors: 0 },
    ])

    expect(steady).toBeGreaterThan(erratic)
    expect(erratic).toBeGreaterThanOrEqual(0)
  })
})

describe('computeResult', () => {
  it('summarises a finished test', () => {
    // 5 keystrokes at 250ms each: the first and last are exactly one second apart.
    const state = type(createSessionState(['ab', 'cd']), 'ab cd', 250)
    const result = computeResult(state)

    expect(state.status).toBe('finished')
    expect(result.durationMs).toBe(1_000)
    expect(result.characters.correct).toBe(5)
    // 5 chars = 1 word, typed in 1/60 min -> 60 wpm
    expect(result.wpm).toBe(60)
    expect(result.accuracy).toBe(100)
    expect(result.timeline).toHaveLength(1)
  })

  it('reports raw speed above net speed when there were mistakes', () => {
    const state = type(createSessionState(['abcd', 'ef']), 'abxd ef', 100)
    const result = computeResult(state)

    expect(result.raw).toBeGreaterThan(result.wpm)
    expect(result.accuracy).toBeLessThan(100)
  })

  it('returns zeroed figures for an untouched session', () => {
    const result = computeResult(createSessionState(['ab']))

    expect(result).toMatchObject({ wpm: 0, raw: 0, accuracy: 0, durationMs: 0 })
  })
})
