import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { EXTEND_THRESHOLD_WORDS } from '@/shared/config'
import { createSessionState, sessionReducer } from './session'
import { selectCaretTarget, selectRemainingWords, selectWordProgress } from './selectors'
import { computeLiveStats, computeResult, selectDurationMs, timeProgress } from './stats'
import { useElapsedTime } from './useElapsedTime'
import type { CaretTarget } from './selectors'
import type { LiveStats, SessionState, TestResult } from './types'

export interface UseTypingTestOptions {
  /** Words to type; `null` while the text is still loading. */
  words: string[] | null
  /** Time limit in seconds, or `null` for word and quote tests. */
  timeLimitSeconds: number | null
  /** Supplies more words for an endless test. */
  extend: (() => string[]) | null
  onFinish: (result: TestResult) => void
}

export interface TypingTestValue {
  state: SessionState
  elapsedMs: number
  /** Remaining time in ms, or `null` when the test is not timed. */
  timeLeftMs: number | null
  /** Completion in the 0..1 range: elapsed time or submitted words. */
  progress: number
  liveStats: LiveStats
  caret: CaretTarget | null
  insert: (char: string) => void
  submitWord: () => void
  deleteChar: () => void
  deleteWord: () => void
  /** Restarts with the same text. */
  repeat: () => void
}

/**
 * Runs one typing test: owns the session state, the clock, endless-mode text
 * top-ups and the hand-off of the finished result.
 */
export const useTypingTest = ({
  words,
  timeLimitSeconds,
  extend,
  onFinish,
}: UseTypingTestOptions): TypingTestValue => {
  const [state, dispatch] = useReducer(sessionReducer, words ?? [], createSessionState)

  const limitMs = timeLimitSeconds === null ? null : timeLimitSeconds * 1000
  const running = state.status === 'running'

  const liveElapsed = useElapsedTime(state.startedAt, running)
  const elapsedMs = state.status === 'finished' ? selectDurationMs(state) : liveElapsed

  // A new text always means a fresh session.
  useEffect(() => {
    if (words) dispatch({ type: 'reset', words })
  }, [words])

  // Stop exactly on the limit, not on the tick that noticed it.
  useEffect(() => {
    if (!running || limitMs === null || state.startedAt === null) return
    if (liveElapsed < limitMs) return

    dispatch({ type: 'finish', at: state.startedAt + limitMs })
  }, [running, limitMs, liveElapsed, state.startedAt])

  // Keep an endless test supplied with words well before the user catches up.
  const remaining = selectRemainingWords(state)
  useEffect(() => {
    if (!running || !extend || remaining > EXTEND_THRESHOLD_WORDS) return

    const nextWords = extend()
    if (nextWords.length > 0) dispatch({ type: 'appendWords', words: nextWords })
  }, [running, extend, remaining])

  // Hand the result over once per finished session.
  const reportedAt = useRef<number | null>(null)
  useEffect(() => {
    if (state.status !== 'finished' || state.finishedAt === null) return
    if (reportedAt.current === state.finishedAt) return

    reportedAt.current = state.finishedAt
    onFinish(computeResult(state))
  }, [state, onFinish])

  const insert = useCallback((char: string) => {
    dispatch({ type: 'insert', char, at: Date.now() })
  }, [])

  const submitWord = useCallback(() => {
    dispatch({ type: 'submitWord', at: Date.now() })
  }, [])

  const deleteChar = useCallback(() => {
    dispatch({ type: 'deleteChar' })
  }, [])

  const deleteWord = useCallback(() => {
    dispatch({ type: 'deleteWord' })
  }, [])

  const repeat = useCallback(() => {
    dispatch({ type: 'reset', words: state.words })
  }, [state.words])

  const liveStats = useMemo(() => computeLiveStats(state, elapsedMs), [state, elapsedMs])

  return {
    state,
    elapsedMs,
    timeLeftMs: limitMs === null ? null : Math.max(0, limitMs - elapsedMs),
    progress: limitMs === null ? selectWordProgress(state) : timeProgress(elapsedMs, limitMs),
    liveStats,
    caret: selectCaretTarget(state),
    insert,
    submitWord,
    deleteChar,
    deleteWord,
    repeat,
  }
}
