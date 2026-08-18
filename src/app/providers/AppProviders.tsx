import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'
import { I18nProvider } from '@/i18n'

export interface AppProvidersProps {
  children: ReactNode
}

/**
 * Cross-cutting providers. `reducedMotion="user"` makes every Motion animation
 * respect the operating system preference without per-component checks.
 */
export const AppProviders = ({ children }: AppProvidersProps) => (
  <I18nProvider>
    <MotionConfig reducedMotion="user">{children}</MotionConfig>
  </I18nProvider>
)
