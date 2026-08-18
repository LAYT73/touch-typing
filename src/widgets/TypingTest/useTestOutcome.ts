import { useCallback, useState } from 'react'
import { createId } from '@/shared/lib/utils'
import { settingsSignature } from '@/features/settings'
import type { Settings } from '@/features/settings'
import { bestWpm, useHistoryStore } from '@/features/results'
import type { Outcome } from '@/features/results'
import type { TestResult } from '@/features/typing'

export interface TestOutcomeApi {
  outcome: Outcome | null
  /** Stores a finished test and compares it against the personal best. */
  record: (result: TestResult) => void
  clear: () => void
}

/**
 * Owns the "test just finished" state: it saves the result to local history and
 * works out whether it beat the previous best for this configuration.
 */
export const useTestOutcome = (settings: Settings): TestOutcomeApi => {
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const add = useHistoryStore((state) => state.add)

  const record = useCallback(
    (result: TestResult) => {
      const signature = settingsSignature(settings)
      // Read the best *before* storing the new result.
      const previousBest = bestWpm(useHistoryStore.getState().results, signature)

      add({
        id: createId(),
        signature,
        wpm: result.wpm,
        raw: result.raw,
        accuracy: result.accuracy,
        consistency: result.consistency,
        durationMs: result.durationMs,
        completedAt: result.completedAt,
      })

      setOutcome({
        result,
        signature,
        isPersonalBest: previousBest !== null && result.wpm > previousBest,
        previousBest,
      })
    },
    [settings, add],
  )

  const clear = useCallback(() => {
    setOutcome(null)
  }, [])

  return { outcome, record, clear }
}
