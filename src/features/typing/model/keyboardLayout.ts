/**
 * The trainer is English-only. A letter from another writing system almost
 * always means the OS keyboard layout is not US/UK QWERTY — the physical keys
 * look right, the glyphs that arrive are not.
 */
const NON_LATIN_LETTER = /(?=\p{L})(?!\p{Script=Latin})/u
const LATIN_LETTER = /\p{Script=Latin}/u

export const isNonLatinLetter = (char: string): boolean =>
  [...char].length === 1 && NON_LATIN_LETTER.test(char)

export const isLatinLetter = (char: string): boolean =>
  [...char].length === 1 && LATIN_LETTER.test(char)
