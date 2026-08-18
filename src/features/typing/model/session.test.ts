import { describe, expect, it } from 'vitest'
import { MAX_EXTRA_CHARS, createSessionState, isTextComplete, sessionReducer } from './session'
import { buildWordChars, selectCaretTarget } from './selectors'
import type { SessionState } from './types'

const START = 1_000

/** Types a string one character at a time, one keystroke per 100ms. */
const type = (state: SessionState, input: string, from = START): SessionState =>
  [...input].reduce((current, char, index) => {
    const at = from + index * 100
    return char === ' '
      ? sessionReducer(current, { type: 'submitWord', at })
      : sessionReducer(current, { type: 'insert', char, at })
  }, state)

describe('sessionReducer', () => {
  it('starts on the first keystroke and records the start time', () => {
    const state = type(createSessionState(['the', 'cat']), 't')

    expect(state.status).toBe('running')
    expect(state.startedAt).toBe(START)
    expect(state.typed[0]).toBe('t')
    expect(state.keystrokes).toEqual([{ at: 0, correct: true }])
  })

  it('marks keystrokes that do not match the expected character', () => {
    const state = type(createSessionState(['the']), 'tx')

    expect(state.keystrokes.map((keystroke) => keystroke.correct)).toEqual([true, false])
  })

  it('ignores a space before any character was typed', () => {
    const started = type(createSessionState(['the', 'cat']), 't')
    const state = sessionReducer(started, { type: 'submitWord', at: START + 100 })
    const unchanged = sessionReducer(state, { type: 'submitWord', at: START + 200 })

    expect(state.wordIndex).toBe(1)
    expect(unchanged.wordIndex).toBe(1)
  })

  it('caps how many extra characters a word accepts', () => {
    const state = type(createSessionState(['ab', 'cd']), 'ab' + 'x'.repeat(MAX_EXTRA_CHARS + 4))

    expect(state.typed[0]).toHaveLength(2 + MAX_EXTRA_CHARS)
  })

  it('finishes as soon as the last word is completed correctly', () => {
    const state = type(createSessionState(['the', 'cat']), 'the cat')

    expect(state.status).toBe('finished')
    expect(isTextComplete(state)).toBe(true)
    expect(state.finishedAt).toBe(START + 600)
  })

  it('finishes on the closing space when the last word has mistakes', () => {
    const state = type(createSessionState(['the', 'cat']), 'the cxt ')

    expect(state.status).toBe('finished')
    expect(state.wordIndex).toBe(2)
  })

  it('ignores input after the test is over', () => {
    const finished = type(createSessionState(['hi']), 'hi')
    const after = sessionReducer(finished, { type: 'insert', char: 'x', at: START + 900 })

    expect(after).toBe(finished)
  })

  describe('deleting', () => {
    it('removes the last character of the current word', () => {
      const state = sessionReducer(type(createSessionState(['the']), 'th'), { type: 'deleteChar' })
      expect(state.typed[0]).toBe('t')
    })

    it('clears the whole word with a word delete', () => {
      const state = sessionReducer(type(createSessionState(['the']), 'th'), { type: 'deleteWord' })
      expect(state.typed[0]).toBe('')
    })

    it('steps back into a previous word that still has mistakes', () => {
      const state = sessionReducer(type(createSessionState(['the', 'cat']), 'thx '), {
        type: 'deleteChar',
      })

      expect(state.wordIndex).toBe(0)
      expect(state.typed[0]).toBe('thx')
    })

    it('does not step back into a word typed correctly', () => {
      const state = sessionReducer(type(createSessionState(['the', 'cat']), 'the '), {
        type: 'deleteChar',
      })

      expect(state.wordIndex).toBe(1)
    })

    it('does not count as a keystroke', () => {
      const typed = type(createSessionState(['the']), 'th')
      const state = sessionReducer(typed, { type: 'deleteChar' })

      expect(state.keystrokes).toHaveLength(2)
    })
  })

  it('extends the text without losing progress', () => {
    const typed = type(createSessionState(['one', 'two']), 'one ')
    const state = sessionReducer(typed, { type: 'appendWords', words: ['three'] })

    expect(state.words).toEqual(['one', 'two', 'three'])
    expect(state.wordIndex).toBe(1)
    expect(state.status).toBe('running')
  })

  it('resets to a fresh state with new words', () => {
    const state = sessionReducer(type(createSessionState(['one']), 'on'), {
      type: 'reset',
      words: ['two'],
    })

    expect(state).toEqual(createSessionState(['two']))
  })
})

describe('buildWordChars', () => {
  it('classifies correct, incorrect and extra characters', () => {
    expect(buildWordChars('cat', 'cxtt', false)).toEqual([
      { char: 'c', status: 'correct' },
      { char: 'a', status: 'incorrect' },
      { char: 't', status: 'correct' },
      { char: 't', status: 'extra' },
    ])
  })

  it('keeps untyped characters pending, but marks them missed once submitted', () => {
    expect(buildWordChars('cat', 'c', false)[2]).toEqual({ char: 't', status: 'pending' })
    expect(buildWordChars('cat', 'c', true)[2]).toEqual({ char: 't', status: 'missed' })
  })

  it('shows the expected character, not the typed one, for mistakes', () => {
    const [first] = buildWordChars('a', 'b', false)
    expect(first?.char).toBe('a')
  })
})

describe('selectCaretTarget', () => {
  it('sits on the next character to type', () => {
    expect(selectCaretTarget(type(createSessionState(['cat']), 'c'))).toEqual({
      wordIndex: 0,
      charIndex: 1,
      after: false,
    })
  })

  it('moves past the last character when the word is fully typed', () => {
    expect(selectCaretTarget(type(createSessionState(['cat', 'sat']), 'cat'))).toEqual({
      wordIndex: 0,
      charIndex: 2,
      after: true,
    })
  })

  it('has no target once the text is complete', () => {
    expect(selectCaretTarget(type(createSessionState(['hi']), 'hi'))).toBeNull()
  })
})
