import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import styles from './Card.module.css'

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Adds a soft accent glow on the top edge. */
  highlighted?: boolean
  children?: ReactNode
}

export const Card = ({
  as: Component = 'div',
  padding = 'md',
  highlighted = false,
  className,
  children,
  ...rest
}: CardProps) => (
  <Component
    className={cn(
      styles.card,
      styles[`padding-${padding}`],
      highlighted && styles.highlighted,
      className,
    )}
    {...rest}
  >
    {children}
  </Component>
)
