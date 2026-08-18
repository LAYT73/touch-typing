import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import type { StyleableProps } from '../types'
import styles from './Stat.module.css'

export interface StatProps extends StyleableProps {
  label: string
  value: ReactNode
  unit?: string
  hint?: ReactNode
  icon?: IconName
  tone?: 'default' | 'accent'
  size?: 'sm' | 'md' | 'lg'
}

/** Label + value pair used for live stats and the result summary. */
export const Stat = ({
  label,
  value,
  unit,
  hint,
  icon,
  tone = 'default',
  size = 'md',
  className,
}: StatProps) => (
  <div className={cn(styles.stat, styles[size], tone === 'accent' && styles.accent, className)}>
    <span className={styles.label}>
      {icon && <Icon name={icon} size="0.95em" />}
      {label}
    </span>
    <span className={styles.value}>
      {value}
      {unit && <span className={styles.unit}>{unit}</span>}
    </span>
    {hint && <span className={styles.hint}>{hint}</span>}
  </div>
)
