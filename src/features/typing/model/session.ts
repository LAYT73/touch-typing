import type { Keystroke, SessionAction, SessionState } from './types'

/** How many characters beyond a word's length the user may type. */
export const MAX_EXTRA_CHARS = 6

export const createSessionState = (words: string[] = []): SessionState => ({
  status: 'idle',
  words,
  typed: [],
  wordIndex: 0,
  startedAt: null,
  finishedAt: null,
  keystrokes: [],
})

const typedAt = (state: SessionState, index: number): string => state.typed[index] ?? ''

const withTyped = (state: SessionState, index: number, value: string): string[] => {
  const typed = [...state.typed]
  while (typed.length <= index) typed.push('')
  typed[index] = value
  return typed
}

const addKeystroke = (
  state: SessionState,
  startedAt: number,
  at: number,
  correct: boolean,
): Keystroke[] => [...state.keystrokes, { at: Math.max(0, at - startedAt), correct }]

export const isTextComplete = (state: SessionState): boolean =>
  state.wordIndex >= state.words.length

/**
 * Pure state machine of a typing test. All timing arrives through actions, which
 * keeps the reducer deterministic and easy to test.
 */
export const sessionReducer = (state: SessionState, action: SessionAction): SessionState => {
  switch (action.type) {
    case 'insert': {
      if (state.status === 'finished') return state

      const expected = state.words[state.wordIndex]
      if (expected === undefined) return state

      const current = typedAt(state, state.wordIndex)
      if (current.length >= expected.length + MAX_EXTRA_CHARS) return state

      const startedAt = state.startedAt ?? action.at
      const next = current + action.char
      const correct = expected[current.length] === action.char

      const isLastWord = state.wordIndex === state.words.length - 1
      const completesText = isLastWord && next === expected

      return {
        ...state,
        status: completesText ? 'finished' : 'running',
        startedAt,
        finishedAt: completesText ? action.at : null,
        typed: withTyped(state, state.wordIndex, next),
        wordIndex: completesText ? state.wordIndex + 1 : state.wordIndex,
        keystrokes: addKeystroke(state, startedAt, action.at, correct),
      }
    }

    case 'submitWord': {
      if (state.status !== 'running') return state

      const expected = state.words[state.wordIndex]
      const current = typedAt(state, state.wordIndex)
      // Leading spaces are ignored so a stray space never skips a word.
      if (expected === undefined || current.length === 0) return state

      const startedAt = state.startedAt ?? action.at
      const nextIndex = state.wordIndex + 1
      const complete = nextIndex >= state.words.length

      return {
        ...state,
        status: complete ? 'finished' : 'running',
        finishedAt: complete ? action.at : null,
        wordIndex: nextIndex,
        keystrokes: addKeystroke(state, startedAt, action.at, current === expected),
      }
    }

    case 'deleteChar': {
      if (state.status !== 'running') return state

      const current = typedAt(state, state.wordIndex)
      if (current.length > 0) {
        return { ...state, typed: withTyped(state, state.wordIndex, current.slice(0, -1)) }
      }

      // At the start of a word: step back only into words that still have errors.
      const previousIndex = state.wordIndex - 1
      if (previousIndex < 0) return state
      if (typedAt(state, previousIndex) === state.words[previousIndex]) return state

      return { ...state, wordIndex: previousIndex }
    }

    case 'deleteWord': {
      if (state.status !== 'running') return state

      const current = typedAt(state, state.wordIndex)
      if (current.length > 0) {
        return { ...state, typed: withTyped(state, state.wordIndex, '') }
      }

      const previousIndex = state.wordIndex - 1
      if (previousIndex < 0) return state
      if (typedAt(state, previousIndex) === state.words[previousIndex]) return state

      return { ...state, wordIndex: previousIndex, typed: withTyped(state, previousIndex, '') }
    }

    case 'appendWords': {
      if (action.words.length === 0) return state
      return { ...state, words: [...state.words, ...action.words] }
    }

    case 'finish': {
      if (state.status !== 'running') return state
      return { ...state, status: 'finished', finishedAt: action.at }
    }

    case 'reset':
      return createSessionState(action.words)
  }
}
