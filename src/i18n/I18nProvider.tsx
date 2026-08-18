import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readStorage, writeStorage } from '@/shared/lib/storage'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, detectLocale, isLocale } from './config'
import type { Locale } from './config'
import { I18nContext } from './i18nContext'
import type { I18nContextValue } from './i18nContext'
import { en } from './locales/en'
import { ru } from './locales/ru'
import { translate, translatePlural } from './translate'
import type { PluralKey, TranslationKey, TranslationParams, Translations } from './types'

const dictionaries: Record<Locale, Translations> = { en, ru }

const readInitialLocale = (): Locale => {
  const stored = readStorage<unknown>(LOCALE_STORAGE_KEY, null)
  return isLocale(stored) ? stored : detectLocale()
}

export interface I18nProviderProps {
  children: ReactNode
  /** Overrides detection and persistence; used in tests. */
  initialLocale?: Locale
}

export const I18nProvider = ({ children, initialLocale }: I18nProviderProps) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? readInitialLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStorage(LOCALE_STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]

    return {
      locale,
      setLocale,
      t: (key: TranslationKey, params?: TranslationParams) => translate(dictionary, key, params),
      tPlural: (key: PluralKey, count: number, params?: TranslationParams) =>
        translatePlural(dictionary, locale, key, count, params),
    }
  }, [locale, setLocale])

  return <I18nContext value={value}>{children}</I18nContext>
}
