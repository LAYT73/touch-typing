import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import type { StyleableProps } from '../types'
import styles from './Tooltip.module.css'

export interface TooltipProps extends StyleableProps {
  content: ReactNode
  children: ReactNode
  placement?: 'top' | 'bottom'
}

/**
 * CSS-only tooltip: shown on hover and keyboard focus of the wrapped control.
 * The content is exposed through `role="tooltip"` rather than a `title`
 * attribute so it also renders on touch-free keyboard navigation.
 */
export const Tooltip = ({ content, children, placement = 'top', className }: TooltipProps) => (
  <span className={cn(styles.wrapper, className)}>
    {children}
    <span role="tooltip" className={cn(styles.bubble, styles[placement])}>
      {content}
    </span>
  </span>
)
