/**
 * Thin, failure-tolerant wrapper around `localStorage`.
 *
 * Access can throw in private browsing modes and stored JSON can be stale or
 * corrupt, so every read falls back to the caller's default instead of crashing
 * the app.
 */

const PREFIX = 'typeflow:'

export const readStorage = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export const writeStorage = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Quota or privacy restrictions: persistence is a nice-to-have, not critical.
  }
}

export const removeStorage = (key: string): void => {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    // Ignored for the same reason as above.
  }
}

/** `localStorage` adapter in the shape expected by zustand's `persist`. */
export const storageKey = (key: string): string => PREFIX + key
