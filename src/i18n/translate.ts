import type { Locale } from './config'
import type { PluralKey, TranslationKey, TranslationParams, Translations } from './types'

const PLACEHOLDER = /\{(\w+)\}/g

/** Replaces `{name}` placeholders, leaving unknown ones untouched for debugging. */
export const interpolate = (template: string, params?: TranslationParams): string => {
  if (!params) return template
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

export const translate = (
  dictionary: Translations,
  key: TranslationKey,
  params?: TranslationParams,
): string => interpolate(dictionary[key], params)

/**
 * Resolves a plural form through `Intl.PluralRules`, so Russian gets its
 * one/few/many forms while English only needs one/other.
 * `count` is always available to the template as `{count}`.
 */
export const translatePlural = (
  dictionary: Translations,
  locale: Locale,
  key: PluralKey,
  count: number,
  params?: TranslationParams,
): string => {
  const category = new Intl.PluralRules(locale).select(count)
  const template = dictionary[`${key}_${category}`] ?? dictionary[`${key}_other`] ?? key
  return interpolate(template, { count, ...params })
}
