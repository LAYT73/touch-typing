import { describe, expect, it } from 'vitest'
import { interpolate, translate, translatePlural } from './translate'
import { en } from './locales/en'
import { ru } from './locales/ru'
import type { TranslationKey } from './types'

describe('interpolate', () => {
  it('replaces named placeholders', () => {
    expect(interpolate('{a} and {b}', { a: 1, b: 'two' })).toBe('1 and two')
  })

  it('keeps unknown placeholders so missing params are visible', () => {
    expect(interpolate('hello {name}', {})).toBe('hello {name}')
  })
})

describe('translate', () => {
  it('resolves keys from the dictionary', () => {
    expect(translate(en, 'mode.timeValue', { seconds: 30 })).toBe('30s')
    expect(translate(ru, 'mode.timeValue', { seconds: 30 })).toBe('30 с')
  })
})

describe('translatePlural', () => {
  it('uses English one/other forms', () => {
    expect(translatePlural(en, 'en', 'history.count', 1)).toBe('1 test')
    expect(translatePlural(en, 'en', 'history.count', 7)).toBe('7 tests')
  })

  it('uses Russian one/few/many forms', () => {
    expect(translatePlural(ru, 'ru', 'history.count', 1)).toBe('1 тест')
    expect(translatePlural(ru, 'ru', 'history.count', 3)).toBe('3 теста')
    expect(translatePlural(ru, 'ru', 'history.count', 11)).toBe('11 тестов')
    expect(translatePlural(ru, 'ru', 'history.count', 21)).toBe('21 тест')
  })
})

describe('locale completeness', () => {
  it('translates every English key in Russian without leftover English copy', () => {
    const keys = Object.keys(en) as TranslationKey[]
    const missing = keys.filter((key) => !ru[key])
    expect(missing).toEqual([])
  })

  it('keeps placeholders consistent across locales', () => {
    const placeholders = (value: string) => (value.match(/\{(\w+)\}/g) ?? []).sort()
    const keys = Object.keys(en) as TranslationKey[]

    const mismatched = keys.filter(
      (key) => placeholders(en[key]).join() !== placeholders(ru[key]).join(),
    )
    expect(mismatched).toEqual([])
  })
})
