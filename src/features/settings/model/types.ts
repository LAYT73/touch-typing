import type {
  CaretStyle,
  QuoteLength,
  TestMode,
  TimeOption,
  WordCountOption,
  WordListId,
} from '@/shared/config'

export interface Settings {
  mode: TestMode
  timeSeconds: TimeOption
  wordCount: WordCountOption
  quoteLength: QuoteLength
  wordListId: WordListId
  punctuation: boolean
  numbers: boolean
  caretStyle: CaretStyle
  smoothCaret: boolean
  showKeyboard: boolean
  showLiveStats: boolean
  blindMode: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  mode: 'time',
  timeSeconds: 30,
  wordCount: 25,
  quoteLength: 'medium',
  wordListId: 'english-1000',
  punctuation: false,
  numbers: false,
  caretStyle: 'line',
  smoothCaret: true,
  showKeyboard: true,
  showLiveStats: true,
  blindMode: false,
}

/**
 * Identifies a comparable test configuration. Personal bests are tracked per
 * signature, so a 15 second test never competes with a 120 second one.
 */
export const settingsSignature = (settings: Settings): string => {
  const base =
    settings.mode === 'time'
      ? `time-${settings.timeSeconds.toString()}`
      : settings.mode === 'words'
        ? `words-${settings.wordCount.toString()}`
        : `quote-${settings.quoteLength}`

  const modifiers = [settings.punctuation && 'punctuation', settings.numbers && 'numbers']
    .filter(Boolean)
    .join('+')

  return modifiers ? `${base}:${modifiers}` : base
}
