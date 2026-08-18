import type { CharState, SessionState, WordStatus } from './types'

export interface CaretTarget {
  wordIndex: number
  /** Index of the character the caret sits on, within the rendered word. */
  charIndex: number
  /** True when the caret belongs after that character (end of the word). */
  after: boolean
}

/**
 * Builds the render model of a single word.
 *
 * - characters the user reached are `correct` / `incorrect`
 * - characters typed beyond the word are `extra`
 * - characters left unwritten are `pending`, or `missed` once the word is submitted
 */
export const buildWordChars = (
  expected: string,
  typed: string,
  submitted: boolean,
): CharState[] => {
  const chars: CharState[] = []

  for (let index = 0; index < expected.length; index += 1) {
    const expectedChar = expected[index]!
    const typedChar = typed[index]

    if (typedChar === undefined) {
      chars.push({ char: expectedChar, status: submitted ? 'missed' : 'pending' })
    } else {
      chars.push({
        char: expectedChar,
        status: typedChar === expectedChar ? 'correct' : 'incorrect',
      })
    }
  }

  for (let index = expected.length; index < typed.length; index += 1) {
    chars.push({ char: typed[index]!, status: 'extra' })
  }

  return chars
}

export const getWordStatus = (
  index: number,
  wordIndex: number,
  expected: string,
  typed: string,
): WordStatus => {
  if (index === wordIndex) return 'active'
  if (index > wordIndex) return 'pending'
  return typed === expected ? 'correct' : 'incorrect'
}

export const selectTypedWord = (state: SessionState, index: number): string =>
  state.typed[index] ?? ''

/** Where the caret should be drawn, expressed in terms of rendered characters. */
export const selectCaretTarget = (state: SessionState): CaretTarget | null => {
  const expected = state.words[state.wordIndex]
  if (expected === undefined) return null

  const typed = selectTypedWord(state, state.wordIndex)
  const renderedLength = Math.max(expected.length, typed.length)
  if (renderedLength === 0) return null

  const atEnd = typed.length >= renderedLength

  return {
    wordIndex: state.wordIndex,
    charIndex: atEnd ? renderedLength - 1 : typed.length,
    after: atEnd,
  }
}

/**
 * The character the user should type next: a letter inside the current word, or
 * a space once the word is fully written. Drives the virtual keyboard hint.
 */
export const selectNextChar = (state: SessionState): string | null => {
  if (state.status === 'finished') return null

  const expected = state.words[state.wordIndex]
  if (expected === undefined) return null

  const typed = selectTypedWord(state, state.wordIndex)
  return typed.length >= expected.length ? ' ' : (expected[typed.length] ?? null)
}

/** Fraction of the text already submitted, in the 0..1 range. */
export const selectWordProgress = (state: SessionState): number =>
  state.words.length === 0 ? 0 : Math.min(1, state.wordIndex / state.words.length)

/** Number of words left, used to decide when an endless test needs more text. */
export const selectRemainingWords = (state: SessionState): number =>
  Math.max(0, state.words.length - state.wordIndex)
