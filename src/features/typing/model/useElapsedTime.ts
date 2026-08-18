import { useState } from 'react'
import { useInterval } from '@/shared/lib/hooks'

/** How often live stats and the timer refresh. */
const TICK_MS = 100

/**
 * Milliseconds since `startedAt`, refreshed while `running`.
 *
 * Only the current time is kept in state; the elapsed value is derived from it.
 * That keeps the timer tied to the wall clock, so a throttled background tab
 * cannot make it drift, and it needs no state resets between tests.
 */
export const useElapsedTime = (startedAt: number | null, running: boolean): number => {
  const [now, setNow] = useState(() => Date.now())

  useInterval(
    () => {
      setNow(Date.now())
    },
    running ? TICK_MS : null,
  )

  if (startedAt === null) return 0
  return Math.max(0, now - startedAt)
}
