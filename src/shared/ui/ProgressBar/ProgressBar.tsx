import { clamp, cn } from '@/shared/lib/utils'
import type { StyleableProps } from '../types'
import styles from './ProgressBar.module.css'

export interface ProgressBarProps extends StyleableProps {
  /** Progress in the 0..1 range. */
  value: number
  label: string
}

export const ProgressBar = ({ value, label, className }: ProgressBarProps) => {
  const progress = clamp(value, 0, 1)

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className={cn(styles.track, className)}
    >
      <div className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
