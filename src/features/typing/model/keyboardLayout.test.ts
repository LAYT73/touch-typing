import { describe, expect, it } from 'vitest'
import { isLatinLetter, isNonLatinLetter } from './keyboardLayout'

describe('keyboardLayout', () => {
  it('treats Cyrillic as the wrong alphabet for this trainer', () => {
    expect(isNonLatinLetter('ф')).toBe(true)
    expect(isNonLatinLetter('Я')).toBe(true)
    expect(isLatinLetter('ф')).toBe(false)
  })

  it('accepts Latin letters, including those produced with Shift', () => {
    expect(isLatinLetter('a')).toBe(true)
    expect(isLatinLetter('Z')).toBe(true)
    expect(isNonLatinLetter('a')).toBe(false)
  })

  it('ignores digits, punctuation and space — those keys often match across layouts', () => {
    expect(isNonLatinLetter('1')).toBe(false)
    expect(isNonLatinLetter(',')).toBe(false)
    expect(isNonLatinLetter(' ')).toBe(false)
    expect(isLatinLetter('1')).toBe(false)
  })
})
