import { motion } from 'motion/react'
import { Icon, Kbd } from '@/shared/ui'
import { useTranslation } from '@/i18n'
import styles from './LayoutHint.module.css'

/** Shown as soon as a non-Latin letter arrives, typically a Cyrillic layout. */
export const LayoutHint = () => {
  const { t } = useTranslation()

  return (
    <motion.p
      className={styles.hint}
      role="status"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <Icon name="globe" size="1.15rem" />
      <span>
        {t('typing.layoutHint')}{' '}
        <span className={styles.shortcut}>
          <Kbd>Ctrl</Kbd>
          <span className={styles.plus}>+</span>
          <Kbd>Space</Kbd>
          <span className={styles.or}>{t('common.or')}</span>
          <Kbd>Alt</Kbd>
          <span className={styles.plus}>+</span>
          <Kbd>Shift</Kbd>
        </span>
      </span>
    </motion.p>
  )
}
