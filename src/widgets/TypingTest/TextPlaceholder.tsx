import { Button, Icon, Spinner } from '@/shared/ui'
import { useTranslation } from '@/i18n'
import styles from './TypingTest.module.css'

export interface TextPlaceholderProps {
  state: 'loading' | 'error'
  onRetry: () => void
}

/** Fills the typing stage while the text data is loading or failed to load. */
export const TextPlaceholder = ({ state, onRetry }: TextPlaceholderProps) => {
  const { t } = useTranslation()

  if (state === 'loading') {
    return (
      <div className={styles.placeholder}>
        <Spinner label={t('typing.loading')} />
        <p className={styles.placeholderText}>{t('typing.loading')}</p>
      </div>
    )
  }

  return (
    <div className={styles.placeholder} role="alert">
      <Icon name="info" size="1.5rem" className={styles.placeholderIcon} />
      <p className={styles.placeholderText}>{t('typing.loadError')}</p>
      <Button variant="secondary" icon="restart" onClick={onRetry}>
        {t('typing.retry')}
      </Button>
    </div>
  )
}
