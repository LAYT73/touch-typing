import { pickRandom, randomInt } from '@/shared/lib/utils'
import type { Random } from '@/shared/lib/utils'

export interface GenerateOptions {
  punctuation: boolean
  numbers: boolean
  /** Injectable for deterministic tests. */
  random?: Random
}

/** Uppercases the first letter, skipping any leading bracket or quote mark. */
const capitalize = (word: string): string =>
  word.replace(/\p{L}/u, (letter) => letter.toUpperCase())

const NUMBER_CHANCE = 0.1

interface Decorated {
  text: string
  endsSentence: boolean
}

/**
 * Adds punctuation to a word based on a single random roll. The thresholds are
 * tuned so roughly a third of the words receive a mark, which reads like prose
 * without turning the test into a symbol drill.
 */
const decorate = (word: string, random: Random): Decorated => {
  const roll = random()

  if (roll < 0.04) return { text: `"${word}"`, endsSentence: false }
  if (roll < 0.07) return { text: `(${word})`, endsSentence: false }
  if (roll < 0.1) return { text: `${word}'s`, endsSentence: false }
  if (roll < 0.14) return { text: `${word};`, endsSentence: false }
  if (roll < 0.18) return { text: `${word}:`, endsSentence: false }
  if (roll < 0.26) return { text: `${word},`, endsSentence: false }
  if (roll < 0.32) return { text: `${word}?`, endsSentence: true }
  if (roll < 0.36) return { text: `${word}!`, endsSentence: true }
  if (roll < 0.46) return { text: `${word}.`, endsSentence: true }

  return { text: word, endsSentence: false }
}

/**
 * Draws `count` words from `pool`, optionally sprinkling in punctuation and
 * numbers. Consecutive duplicates are avoided so the text never stutters.
 */
export const generateWords = (
  pool: readonly string[],
  count: number,
  { punctuation, numbers, random = Math.random }: GenerateOptions,
): string[] => {
  if (pool.length === 0 || count <= 0) return []

  const words: string[] = []
  let startSentence = punctuation
  let previous = ''

  while (words.length < count) {
    if (numbers && random() < NUMBER_CHANCE) {
      words.push(String(randomInt(9_000, random) + 1))
      previous = ''
      continue
    }

    let word = pickRandom(pool, random)
    if (word === previous && pool.length > 1) continue
    previous = word

    if (punctuation) {
      const decorated = decorate(word, random)
      word = startSentence ? capitalize(decorated.text) : decorated.text
      startSentence = decorated.endsSentence
    }

    words.push(word)
  }

  return words
}

/** Splits a quote into typeable words, collapsing any irregular whitespace. */
export const splitQuote = (text: string): string[] => text.trim().split(/\s+/)
