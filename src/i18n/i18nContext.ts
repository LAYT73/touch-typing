import { createContext } from 'react'
import type { Locale } from './config'
import type { PluralKey, TranslationKey, TranslationParams } from './types'

export interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  /** Translate a key, interpolating `{placeholders}`. */
  t: (key: TranslationKey, params?: TranslationParams) => string
  /** Translate a count-aware key using the locale's plural rules. */
  tPlural: (key: PluralKey, count: number, params?: TranslationParams) => string
}

export const I18nContext = createContext<I18nContextValue | null>(null)
