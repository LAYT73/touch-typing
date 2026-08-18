import type { Quote } from '../model/types'

/**
 * Parses a plain-text word list: one word per line, `#` comments and blank
 * lines ignored.
 */
export const parseWordList = (raw: string): string[] =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))

const isQuote = (value: unknown): value is Quote => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    candidate.text.trim().length > 0 &&
    typeof candidate.author === 'string' &&
    typeof candidate.source === 'string'
  )
}

/** Parses the quotes file, dropping any entry that does not match the shape. */
export const parseQuotes = (raw: string): Quote[] => {
  const data: unknown = JSON.parse(raw)
  if (typeof data !== 'object' || data === null) return []

  const { quotes } = data as { quotes?: unknown }
  if (!Array.isArray(quotes)) return []

  return quotes.filter(isQuote).map((quote) => ({ ...quote, text: quote.text.trim() }))
}
