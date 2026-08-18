import { motion } from 'motion/react'
import { Icon } from '@/shared/ui'
import { useTranslation } from '@/i18n'
import styles from './FocusOverlay.module.css'

/** Shown over the text while the typing surface does not have focus. */
export const FocusOverlay = () => {
  const { t } = useTranslation()

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <span className={styles.badge}>
        <Icon name="keyboard" size="1.1rem" />
        {t('typing.focusTitle')}
      </span>
      <span className={styles.hint}>{t('typing.focusHint')}</span>
    </motion.div>
  )
}
