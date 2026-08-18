import { motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { useTranslation } from '@/i18n'
import { KEYBOARD_ROWS, SPACE_KEY_ID, findKey, isShiftKey } from '../../model/layout'
import styles from './VirtualKeyboard.module.css'

export interface VirtualKeyboardProps {
  /** The character the user is expected to type next. */
  nextChar: string | null
}

/** Shows the layout and points at the key to press next. */
export const VirtualKeyboard = ({ nextChar }: VirtualKeyboardProps) => {
  const { t } = useTranslation()
  const match = nextChar === null ? null : findKey(nextChar)

  return (
    <motion.div
      className={styles.keyboard}
      role="img"
      aria-label={t('keyboard.label')}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.row}>
          {row.map((key) => {
            const isNext = match?.keyId === key.id
            const needsShift = Boolean(match?.shift) && isShiftKey(key.id)
            const caption = key.id === SPACE_KEY_ID ? t('keyboard.space') : (key.label ?? key.lower)

            return (
              <span
                key={key.id}
                className={cn(
                  styles.key,
                  key.id === SPACE_KEY_ID && styles.space,
                  isNext && styles.next,
                  needsShift && styles.modifier,
                )}
                style={{ flexGrow: key.width ?? 1 }}
              >
                {caption}
              </span>
            )
          })}
        </div>
      ))}
    </motion.div>
  )
}
