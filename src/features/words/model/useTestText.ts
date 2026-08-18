import { useCallback, useEffect, useMemo, useState } from 'react'
import { clamp, createRandom } from '@/shared/lib/utils'
import type { Random } from '@/shared/lib/utils'
import {
  EXTEND_CHUNK_WORDS,
  MAX_GENERATED_WORDS,
  MIN_GENERATED_WORDS,
  WORDS_PER_SECOND_BUFFER,
} from '@/shared/config'
import type { QuoteLength, TestMode } from '@/shared/config'
import type { Settings } from '@/features/settings'
import { fetchQuotes, fetchWordList } from '../api/textSource'
import { generateWords, splitQuote } from './generateText'
import { selectQuote } from './quotes'
import type { Quote, TestText } from './types'

export type TextStatus = 'loading' | 'ready' | 'error'

interface Source {
  pool: string[]
  quotes: Quote[]
}

/** Loaded data tagged with the request it answered. */
interface LoadedSource {
  key: string
  source: Source
}

/** The subset of settings that decides what text the user gets. */
interface TextShape {
  mode: TestMode
  timeSeconds: number
  wordCount: number
  quoteLength: QuoteLength
  punctuation: boolean
  numbers: boolean
}

export interface UseTestTextResult {
  status: TextStatus
  text: TestText | null
  /** Builds a fresh text with the current settings. */
  regenerate: () => void
  /** Retries a failed data request. */
  retry: () => void
  /** Extra words for endless tests; empty when the mode has a fixed text. */
  extend: (count?: number) => string[]
}

/** Word budget generated up front for a timed test. */
const bufferSize = (seconds: number): number =>
  clamp(seconds * WORDS_PER_SECOND_BUFFER, MIN_GENERATED_WORDS, MAX_GENERATED_WORDS)

const buildText = (source: Source, shape: TextShape, random: Random): TestText => {
  if (shape.mode === 'quote') {
    const quote = selectQuote(source.quotes, shape.quoteLength, random)
    if (!quote) return { words: [], quote: null, extendable: false }

    return {
      words: splitQuote(quote.text),
      quote: { author: quote.author, source: quote.source },
      extendable: false,
    }
  }

  const count = shape.mode === 'time' ? bufferSize(shape.timeSeconds) : shape.wordCount

  return {
    words: generateWords(source.pool, count, {
      punctuation: shape.punctuation,
      numbers: shape.numbers,
      random,
    }),
    quote: null,
    extendable: shape.mode === 'time',
  }
}

const randomSeed = (): number => Math.floor(Math.random() * 2 ** 31)

/**
 * Loads the data file the current mode needs and derives the text to type.
 *
 * The text is a pure function of (data, settings, seed), so it is memoised
 * rather than stored: it can never change on its own mid-test, and asking for a
 * new text is just a new seed. Cosmetic settings like the caret style are not
 * part of that input, so changing them leaves the text alone.
 */
export const useTestText = (settings: Settings): UseTestTextResult => {
  const { mode, timeSeconds, wordCount, quoteLength, punctuation, numbers, wordListId } = settings

  const [seed, setSeed] = useState(randomSeed)
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<LoadedSource | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)

  const needsQuotes = mode === 'quote'
  // The attempt counter is part of the key, so a retry is a different request
  // and the previous failure no longer applies.
  const requestKey = `${needsQuotes ? 'quotes' : `words:${wordListId}`}#${attempt.toString()}`

  useEffect(() => {
    let active = true

    const load = async (): Promise<Source> =>
      needsQuotes
        ? { pool: [], quotes: await fetchQuotes() }
        : { pool: await fetchWordList(wordListId), quotes: [] }

    load()
      .then((source) => {
        if (active) setLoaded({ key: requestKey, source })
      })
      .catch(() => {
        if (active) setFailedKey(requestKey)
      })

    return () => {
      active = false
    }
  }, [needsQuotes, wordListId, requestKey])

  const source = loaded?.key === requestKey ? loaded.source : null
  const status: TextStatus = source ? 'ready' : failedKey === requestKey ? 'error' : 'loading'

  const text = useMemo(
    () =>
      source === null
        ? null
        : buildText(
            source,
            { mode, timeSeconds, wordCount, quoteLength, punctuation, numbers },
            createRandom(seed),
          ),
    [source, seed, mode, timeSeconds, wordCount, quoteLength, punctuation, numbers],
  )

  const regenerate = useCallback(() => {
    setSeed(randomSeed)
  }, [])

  const retry = useCallback(() => {
    setAttempt((value) => value + 1)
  }, [])

  const extend = useCallback(
    (count = EXTEND_CHUNK_WORDS): string[] => {
      if (!source || source.pool.length === 0) return []
      return generateWords(source.pool, count, { punctuation, numbers })
    },
    [source, punctuation, numbers],
  )

  return { status, text, regenerate, retry, extend }
}
