import type { WordListId } from '@/shared/config'
import { QUOTES_FILE, WORD_LISTS } from '../model/types'
import type { Quote } from '../model/types'
import { parseQuotes, parseWordList } from './parse'

/** Resolves a path inside `public/` against the deployment base URL. */
const assetUrl = (path: string): string => `${import.meta.env.BASE_URL}${path}`

/** In-flight and finished requests are shared, so switching back is instant. */
const cache = new Map<string, Promise<unknown>>()

const loadOnce = <T>(key: string, load: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key) as Promise<T> | undefined
  if (cached) return cached

  const promise = load().catch((error: unknown) => {
    // A failed request must not be cached, otherwise "retry" could never work.
    cache.delete(key)
    throw error
  })

  cache.set(key, promise)
  return promise
}

const fetchText = async (path: string): Promise<string> => {
  const response = await fetch(assetUrl(path))
  if (!response.ok) {
    throw new Error(`Failed to load "${path}": ${response.status.toString()}`)
  }
  return response.text()
}

export const fetchWordList = (id: WordListId): Promise<string[]> =>
  loadOnce(`words:${id}`, async () => {
    const words = parseWordList(await fetchText(WORD_LISTS[id].file))
    if (words.length === 0) throw new Error(`Word list "${id}" is empty`)
    return words
  })

export const fetchQuotes = (): Promise<Quote[]> =>
  loadOnce('quotes', async () => {
    const quotes = parseQuotes(await fetchText(QUOTES_FILE))
    if (quotes.length === 0) throw new Error('Quote list is empty')
    return quotes
  })
