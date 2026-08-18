import { motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import type { CaretStyle } from '@/shared/config'
import type { CaretMotion } from './useCaretMotion'
import styles from './WordsView.module.css'

export interface CaretProps {
  motionValues: CaretMotion
  style: CaretStyle
  /** Blinks while the test is idle or finished, stays solid while typing. */
  blinking: boolean
  hidden: boolean
}

export const Caret = ({ motionValues, style, blinking, hidden }: CaretProps) => {
  if (hidden) return null

  const { x, y, width, height } = motionValues

  return (
    <motion.span
      className={cn(styles.caret, styles[`caret-${style}`], blinking && styles.caretBlinking)}
      aria-hidden
      style={{ x, y, width, height }}
    />
  )
}
