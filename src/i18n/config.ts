export const LOCALES = ['en', 'ru'] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/** Language names are always written in their own language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
}

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: 'EN',
  ru: 'RU',
}

export const LOCALE_STORAGE_KEY = 'locale'

export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value)

/** Picks the best supported locale for the current browser. */
export const detectLocale = (
  languages: readonly string[] = typeof navigator === 'undefined' ? [] : navigator.languages,
): Locale => {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (isLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
