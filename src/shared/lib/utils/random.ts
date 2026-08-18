/**
 * Deterministic PRNG (mulberry32). A seeded generator keeps text generation
 * reproducible, which makes the word-list tests stable.
 */
export const createRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Random = () => number

export const randomInt = (max: number, random: Random = Math.random): number =>
  Math.floor(random() * max)

export const pickRandom = <T>(items: readonly T[], random: Random = Math.random): T => {
  if (items.length === 0) throw new Error('pickRandom: cannot pick from an empty list')
  return items[randomInt(items.length, random)]!
}

export const shuffle = <T>(items: readonly T[], random: Random = Math.random): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1, random)
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}
