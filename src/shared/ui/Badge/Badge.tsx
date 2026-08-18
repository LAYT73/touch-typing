import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import type { StyleableProps } from '../types'
import styles from './Badge.module.css'

export interface BadgeProps extends StyleableProps {
  children: ReactNode
  tone?: 'neutral' | 'accent' | 'success' | 'danger'
  icon?: IconName
}

export const Badge = ({ children, tone = 'neutral', icon, className }: BadgeProps) => (
  <span className={cn(styles.badge, styles[tone], className)}>
    {icon && <Icon name={icon} size="0.9em" />}
    {children}
  </span>
)
