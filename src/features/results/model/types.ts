import type { TestResult } from '@/features/typing'

/** A finished test as it is kept in local history. */
export interface StoredResult {
  id: string
  /** Test configuration this result belongs to, e.g. `time-30:punctuation`. */
  signature: string
  wpm: number
  raw: number
  accuracy: number
  consistency: number
  durationMs: number
  completedAt: number
}

/** The result currently on screen, plus how it compares to the user's history. */
export interface Outcome {
  result: TestResult
  signature: string
  isPersonalBest: boolean
  previousBest: number | null
}
