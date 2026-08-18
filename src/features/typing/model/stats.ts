import {
  clamp,
  mean,
  msToMinutes,
  percentage,
  ratio,
  roundTo,
  standardDeviation,
} from '@/shared/lib/utils'
import type {
  CharacterCounts,
  Keystroke,
  LiveStats,
  SessionState,
  TestResult,
  TimelinePoint,
} from './types'

/** A "word" is five characters, the standard unit behind every WPM figure. */
export const CHARS_PER_WORD = 5

const emptyCounts = (): CharacterCounts => ({ correct: 0, incorrect: 0, extra: 0, missed: 0 })

/**
 * Counts characters across every word the user has reached.
 *
 * Submitted words contribute a space, which counts as a typed character just
 * like the letters around it.
 */
export const countCharacters = (state: SessionState): CharacterCounts => {
  const counts = emptyCounts()
  const lastIndex = Math.min(state.wordIndex, state.words.length - 1)

  for (let index = 0; index <= lastIndex; index += 1) {
    const expected = state.words[index] ?? ''
    const typed = state.typed[index] ?? ''
    const submitted = index < state.wordIndex

    for (let position = 0; position < expected.length; position += 1) {
      const typedChar = typed[position]
      if (typedChar === undefined) {
        if (submitted) counts.missed += 1
      } else if (typedChar === expected[position]) {
        counts.correct += 1
      } else {
        counts.incorrect += 1
      }
    }

    if (typed.length > expected.length) {
      counts.extra += typed.length - expected.length
    }

    // The space that separated this word from the next one.
    if (submitted && index < state.words.length - 1) {
      counts.correct += 1
    }
  }

  return counts
}

export const totalTypedCharacters = (counts: CharacterCounts): number =>
  counts.correct + counts.incorrect + counts.extra

/** Net speed: only correctly typed characters count. */
export const computeWpm = (correctChars: number, durationMs: number): number => {
  const minutes = msToMinutes(durationMs)
  if (minutes <= 0) return 0
  return roundTo(correctChars / CHARS_PER_WORD / minutes, 1)
}

/** Gross speed: every character the user produced counts, mistakes included. */
export const computeRawWpm = (typedChars: number, durationMs: number): number =>
  computeWpm(typedChars, durationMs)

/**
 * Share of keystrokes that hit the right character on the first attempt.
 * Corrections do not repair accuracy, which is what makes it a useful signal.
 */
export const computeAccuracy = (keystrokes: readonly Keystroke[]): number => {
  if (keystrokes.length === 0) return 0
  const correct = keystrokes.filter((keystroke) => keystroke.correct).length
  return percentage(correct, keystrokes.length, 1)
}

/**
 * Per-second samples for the result chart.
 *
 * `raw` is the speed inside that second alone, `wpm` is the net speed since the
 * start of the test, which makes the curve settle down as the test goes on.
 */
export const buildTimeline = (
  keystrokes: readonly Keystroke[],
  durationMs: number,
): TimelinePoint[] => {
  const seconds = Math.max(1, Math.ceil(durationMs / 1000))
  const points: TimelinePoint[] = []

  let cursor = 0
  let correctSoFar = 0

  for (let second = 1; second <= seconds; second += 1) {
    const until = second * 1000
    let inSecond = 0
    let errors = 0

    while (cursor < keystrokes.length && keystrokes[cursor]!.at < until) {
      const keystroke = keystrokes[cursor]!
      inSecond += 1
      if (keystroke.correct) correctSoFar += 1
      else errors += 1
      cursor += 1
    }

    points.push({
      second,
      raw: roundTo((inSecond / CHARS_PER_WORD) * 60, 1),
      wpm: computeWpm(correctSoFar, until),
      errors,
    })
  }

  return points
}

/**
 * How steady the typing was: 100% means every second had the same speed.
 * Derived from the coefficient of variation of the per-second raw samples.
 */
export const computeConsistency = (timeline: readonly TimelinePoint[]): number => {
  const samples = timeline.map((point) => point.raw)
  if (samples.length < 2) return 0

  const average = mean(samples)
  if (average === 0) return 0

  const coefficient = standardDeviation(samples) / average
  return roundTo(clamp((1 - coefficient) * 100, 0, 100), 1)
}

/** Speed and accuracy while the test is still running. */
export const computeLiveStats = (state: SessionState, elapsedMs: number): LiveStats => {
  const counts = countCharacters(state)
  return {
    wpm: computeWpm(counts.correct, elapsedMs),
    raw: computeRawWpm(totalTypedCharacters(counts), elapsedMs),
    accuracy: computeAccuracy(state.keystrokes),
  }
}

export const selectDurationMs = (state: SessionState): number => {
  if (state.startedAt === null) return 0
  const end = state.finishedAt ?? state.startedAt
  return Math.max(0, end - state.startedAt)
}

export const computeResult = (state: SessionState): TestResult => {
  const durationMs = selectDurationMs(state)
  const characters = countCharacters(state)
  const timeline = buildTimeline(state.keystrokes, durationMs)

  return {
    wpm: computeWpm(characters.correct, durationMs),
    raw: computeRawWpm(totalTypedCharacters(characters), durationMs),
    accuracy: computeAccuracy(state.keystrokes),
    consistency: computeConsistency(timeline),
    durationMs,
    characters,
    timeline,
    completedAt: state.finishedAt ?? Date.now(),
  }
}

/** Exported for the progress bar in time mode. */
export const timeProgress = (elapsedMs: number, limitMs: number | null): number =>
  limitMs === null ? 0 : clamp(ratio(elapsedMs, limitMs), 0, 1)
