import { pickRandom } from '@/shared/lib/utils'
import type { Random } from '@/shared/lib/utils'
import type { QuoteLength } from '@/shared/config'
import { QUOTE_LENGTH_LIMITS } from './types'
import type { Quote } from './types'

export const quoteLengthOf = (quote: Quote): Exclude<QuoteLength, 'any'> => {
  if (quote.text.length <= QUOTE_LENGTH_LIMITS.short) return 'short'
  if (quote.text.length <= QUOTE_LENGTH_LIMITS.medium) return 'medium'
  return 'long'
}

/**
 * Picks a random quote of the requested length. Falls back to the full list
 * when a length group happens to be empty, so the test always has text.
 */
export const selectQuote = (
  quotes: readonly Quote[],
  length: QuoteLength,
  random: Random = Math.random,
): Quote | null => {
  if (quotes.length === 0) return null

  const candidates =
    length === 'any' ? quotes : quotes.filter((quote) => quoteLengthOf(quote) === length)

  return pickRandom(candidates.length > 0 ? candidates : quotes, random)
}
