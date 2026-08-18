import type { en } from './locales/en'

/** Every translatable string in the app. Derived from the English dictionary. */
export type TranslationKey = keyof typeof en

export type PluralCategory = Intl.LDMLPluralRule

/**
 * A locale dictionary must cover all base keys, and may add any plural
 * variants its language needs (Russian uses `_one`, `_few`, `_many`).
 */
export type Translations = Record<TranslationKey, string> &
  Partial<Record<`${string}_${PluralCategory}`, string>>

type StripPluralSuffix<TKey> = TKey extends `${infer TBase}_one` ? TBase : never

/** Keys that can be used with the plural-aware translator. */
export type PluralKey = StripPluralSuffix<TranslationKey>

export type TranslationParams = Record<string, string | number>
