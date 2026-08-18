import type { I18nContextValue } from '@/i18n'
import type { Settings } from '@/features/settings'

/** Short description of the active configuration, e.g. "Time · 30s". */
export const formatModeLabel = (settings: Settings, t: I18nContextValue['t']): string => {
  switch (settings.mode) {
    case 'time':
      return `${t('mode.time')} · ${t('mode.timeValue', { seconds: settings.timeSeconds })}`
    case 'words':
      return `${t('mode.words')} · ${t('mode.wordsValue', { count: settings.wordCount })}`
    case 'quote':
      return `${t('mode.quote')} · ${t(`quoteLength.${settings.quoteLength}`)}`
  }
}
