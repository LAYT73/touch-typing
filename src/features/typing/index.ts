export { createSessionState, sessionReducer } from './model/session'
export {
  buildWordChars,
  getWordStatus,
  selectCaretTarget,
  selectNextChar,
  selectRemainingWords,
  selectWordProgress,
} from './model/selectors'
export {
  buildTimeline,
  computeAccuracy,
  computeConsistency,
  computeLiveStats,
  computeResult,
  computeWpm,
  countCharacters,
} from './model/stats'
export { useTypingTest } from './model/useTypingTest'
export type { TypingTestValue, UseTypingTestOptions } from './model/useTypingTest'
export type {
  CharStatus,
  LiveStats as LiveStatsValue,
  SessionState,
  TestResult,
  TimelinePoint,
} from './model/types'
export { LiveStats } from './ui/LiveStats'
export { TypingArea } from './ui/TypingArea'
