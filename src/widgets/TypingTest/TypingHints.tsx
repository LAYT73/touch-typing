import { Kbd } from '@/shared/ui'
import { useTranslation } from '@/i18n'
import styles from './TypingTest.module.css'

/** Keyboard shortcuts, also referenced by the typing surface for screen readers. */
export const TypingHints = () => {
  const { t } = useTranslation()

  return (
    <p className={styles.hints} id="typing-hints">
      <span className={styles.hint}>
        <Kbd>Tab</Kbd> {t('typing.hintNewText')}
      </span>
      <span className={styles.hint}>
        <Kbd>Esc</Kbd> {t('typing.hintRestart')}
      </span>
      <span className={styles.hint}>
        <Kbd>Ctrl</Kbd>
        <span className={styles.plus}>+</span>
        <Kbd>⌫</Kbd> {t('typing.hintDeleteWord')}
      </span>
    </p>
  )
}
