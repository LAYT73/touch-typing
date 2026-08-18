import type { WordListId } from '@/shared/config'

export interface Quote {
  id: string
  text: string
  author: string
  source: string
}

export interface QuoteMeta {
  author: string
  source: string
}

/** A ready-to-type text. */
export interface TestText {
  words: string[]
  /** Attribution, present only in quote mode. */
  quote: QuoteMeta | null
  /** Whether more words can be appended (endless time mode). */
  extendable: boolean
}

export interface WordListDescriptor {
  id: WordListId
  /** Path relative to the app base URL. */
  file: string
}

export const WORD_LISTS: Record<WordListId, WordListDescriptor> = {
  'english-200': { id: 'english-200', file: 'data/words/english-200.txt' },
  'english-1000': { id: 'english-1000', file: 'data/words/english-1000.txt' },
}

export const QUOTES_FILE = 'data/quotes/english.json'

/** Character-count boundaries used to group quotes by length. */
export const QUOTE_LENGTH_LIMITS = { short: 80, medium: 120 } as const
