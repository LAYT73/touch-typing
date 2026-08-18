import { describe, expect, it } from 'vitest'
import { createRandom } from '@/shared/lib/utils'
import { parseQuotes, parseWordList } from '../api/parse'
import { generateWords, splitQuote } from './generateText'
import { quoteLengthOf, selectQuote } from './quotes'
import type { Quote } from './types'

const POOL = ['the', 'quick', 'brown', 'fox', 'jumps']

describe('parseWordList', () => {
  it('reads one word per line and skips comments and blank lines', () => {
    const raw = ['# english-200', '# 2 words', '', 'the  ', 'of', '', '# trailing note'].join('\n')

    expect(parseWordList(raw)).toEqual(['the', 'of'])
  })

  it('handles CRLF line endings', () => {
    expect(parseWordList('one\r\ntwo\r\n')).toEqual(['one', 'two'])
  })
})

describe('parseQuotes', () => {
  it('keeps only well-formed entries', () => {
    const raw = JSON.stringify({
      quotes: [
        { id: 'a', text: '  Hello there.  ', author: 'Someone', source: 'Somewhere' },
        { id: 'b', text: '', author: 'Someone', source: 'Somewhere' },
        { id: 'c', text: 'No author' },
        'not an object',
      ],
    })

    expect(parseQuotes(raw)).toEqual([
      { id: 'a', text: 'Hello there.', author: 'Someone', source: 'Somewhere' },
    ])
  })

  it('returns an empty list for unexpected payloads', () => {
    expect(parseQuotes('{}')).toEqual([])
    expect(parseQuotes('{"quotes":"nope"}')).toEqual([])
  })
})

describe('generateWords', () => {
  it('generates the requested number of words from the pool', () => {
    const words = generateWords(POOL, 12, {
      punctuation: false,
      numbers: false,
      random: createRandom(42),
    })

    expect(words).toHaveLength(12)
    expect(words.every((word) => POOL.includes(word))).toBe(true)
  })

  it('never repeats the same word twice in a row', () => {
    const words = generateWords(POOL, 200, {
      punctuation: false,
      numbers: false,
      random: createRandom(7),
    })

    const repeats = words.filter((word, index) => index > 0 && word === words[index - 1])
    expect(repeats).toEqual([])
  })

  it('is reproducible for a given seed', () => {
    const options = { punctuation: true, numbers: true }
    const first = generateWords(POOL, 30, { ...options, random: createRandom(99) })
    const second = generateWords(POOL, 30, { ...options, random: createRandom(99) })

    expect(first).toEqual(second)
  })

  it('adds punctuation and starts sentences with a capital letter', () => {
    const words = generateWords(POOL, 60, {
      punctuation: true,
      numbers: false,
      random: createRandom(3),
    })

    expect(words.some((word) => /[.,?!;:]/.test(word))).toBe(true)
    expect(words[0]).toMatch(/^["(]?[A-Z]/)
  })

  it('mixes in numeric tokens only when asked', () => {
    const withNumbers = generateWords(POOL, 120, {
      punctuation: false,
      numbers: true,
      random: createRandom(11),
    })
    const withoutNumbers = generateWords(POOL, 120, {
      punctuation: false,
      numbers: false,
      random: createRandom(11),
    })

    expect(withNumbers.some((word) => /^\d+$/.test(word))).toBe(true)
    expect(withoutNumbers.some((word) => /\d/.test(word))).toBe(false)
  })

  it('returns nothing for an empty pool', () => {
    expect(generateWords([], 10, { punctuation: false, numbers: false })).toEqual([])
  })
})

describe('splitQuote', () => {
  it('splits on any whitespace run', () => {
    expect(splitQuote('  a  b\nc ')).toEqual(['a', 'b', 'c'])
  })
})

describe('quotes', () => {
  const quotes: Quote[] = [
    { id: 'short', text: 'a'.repeat(40), author: 'A', source: 'S' },
    { id: 'medium', text: 'b'.repeat(100), author: 'B', source: 'S' },
    { id: 'long', text: 'c'.repeat(200), author: 'C', source: 'S' },
  ]

  it('groups quotes by character count', () => {
    expect(quotes.map(quoteLengthOf)).toEqual(['short', 'medium', 'long'])
  })

  it('selects a quote from the requested group', () => {
    expect(selectQuote(quotes, 'long', createRandom(1))?.id).toBe('long')
  })

  it('falls back to any quote when the group is empty', () => {
    const onlyShort = [quotes[0]!]
    expect(selectQuote(onlyShort, 'long', createRandom(1))?.id).toBe('short')
  })

  it('returns null without quotes', () => {
    expect(selectQuote([], 'any')).toBeNull()
  })
})
