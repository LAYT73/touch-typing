export type SessionStatus = 'idle' | 'running' | 'finished'

export interface Keystroke {
  /** Milliseconds since the session started. */
  at: number
  correct: boolean
}

export interface SessionState {
  status: SessionStatus
  /** The text to type, split into words. */
  words: string[]
  /** What the user typed for each word, index-aligned with `words`. */
  typed: string[]
  /** Index of the word being typed; equals `words.length` once the text is done. */
  wordIndex: number
  /** Absolute timestamps, so results can be computed after the fact. */
  startedAt: number | null
  finishedAt: number | null
  keystrokes: Keystroke[]
}

export type SessionAction =
  | { type: 'insert'; char: string; at: number }
  | { type: 'submitWord'; at: number }
  | { type: 'deleteChar' }
  | { type: 'deleteWord' }
  | { type: 'appendWords'; words: string[] }
  | { type: 'finish'; at: number }
  | { type: 'reset'; words: string[] }

export type CharStatus = 'pending' | 'correct' | 'incorrect' | 'extra' | 'missed'

export interface CharState {
  char: string
  status: CharStatus
}

export type WordStatus = 'pending' | 'active' | 'correct' | 'incorrect'

export interface CharacterCounts {
  correct: number
  incorrect: number
  extra: number
  missed: number
}

export interface TimelinePoint {
  /** Elapsed second this sample describes (1-based). */
  second: number
  /** Net speed since the start of the test. */
  wpm: number
  /** Instantaneous speed during this second, mistakes included. */
  raw: number
  /** Mistyped keystrokes during this second. */
  errors: number
}

export interface LiveStats {
  wpm: number
  raw: number
  accuracy: number
}

export interface TestResult {
  wpm: number
  raw: number
  accuracy: number
  consistency: number
  durationMs: number
  characters: CharacterCounts
  timeline: TimelinePoint[]
  completedAt: number
}
