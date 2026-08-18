let counter = 0

/**
 * Unique id for locally stored records. `crypto.randomUUID` is unavailable on
 * insecure origins, so a timestamp-based id acts as the fallback.
 */
export const createId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  counter += 1
  return `${Date.now().toString(36)}-${counter.toString(36)}`
}
