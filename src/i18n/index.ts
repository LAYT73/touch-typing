export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_LABELS,
  LOCALE_SHORT_LABELS,
  detectLocale,
  isLocale,
} from './config'
export type { Locale } from './config'
export { I18nProvider } from './I18nProvider'
export type { I18nProviderProps } from './I18nProvider'
export { useTranslation } from './useTranslation'
export type { I18nContextValue } from './i18nContext'
export { interpolate, translate, translatePlural } from './translate'
export type { PluralKey, TranslationKey, TranslationParams, Translations } from './types'
