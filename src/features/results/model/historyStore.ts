import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '@/shared/lib/storage'
import type { StoredResult } from './types'

/** Only the most recent results are kept, oldest first out. */
export const HISTORY_LIMIT = 50

interface HistoryStore {
  results: StoredResult[]
  add: (result: StoredResult) => void
  clear: () => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      results: [],
      add: (result) => {
        set((state) => ({ results: [result, ...state.results].slice(0, HISTORY_LIMIT) }))
      },
      clear: () => {
        set({ results: [] })
      },
    }),
    { name: storageKey('history'), version: 1 },
  ),
)

/** Best speed recorded for a configuration, or `null` when there is none yet. */
export const bestWpm = (results: readonly StoredResult[], signature: string): number | null => {
  const matching = results.filter((result) => result.signature === signature)
  if (matching.length === 0) return null
  return Math.max(...matching.map((result) => result.wpm))
}

export const averageWpm = (results: readonly StoredResult[]): number => {
  if (results.length === 0) return 0
  const total = results.reduce((sum, result) => sum + result.wpm, 0)
  return Math.round(total / results.length)
}

/**
 * The store selector returns the stable array; slicing happens in a memo so the
 * hook never hands React a fresh array on every render.
 */
export const useRecentResults = (limit: number): StoredResult[] => {
  const results = useHistoryStore((state) => state.results)
  return useMemo(() => results.slice(0, limit), [results, limit])
}
