import { useContext } from 'react'
import { I18nContext } from './i18nContext'
import type { I18nContextValue } from './i18nContext'

export const useTranslation = (): I18nContextValue => {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslation must be used inside <I18nProvider>')
  }
  return context
}
