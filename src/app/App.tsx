import { useCallback, useState } from 'react'
import { useTranslation } from '@/i18n'
import { SettingsDialog } from '@/features/settings'
import { Footer } from '@/widgets/Footer'
import { Header } from '@/widgets/Header'
import { TypingTest } from '@/widgets/TypingTest'
import styles from './App.module.css'

export const App = () => {
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const openSettings = useCallback(() => {
    setSettingsOpen(true)
  }, [])

  const closeSettings = useCallback(() => {
    setSettingsOpen(false)
  }, [])

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#typing-test">
        {t('app.skipToTest')}
      </a>

      <div className={styles.shell}>
        <Header />

        <main className={styles.main} id="typing-test">
          <TypingTest settingsOpen={settingsOpen} onOpenSettings={openSettings} />
        </main>

        <Footer />
      </div>

      <SettingsDialog open={settingsOpen} onClose={closeSettings} />
    </div>
  )
}
