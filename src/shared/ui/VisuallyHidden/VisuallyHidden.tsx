import type { ReactNode } from 'react'
import styles from './VisuallyHidden.module.css'

export interface VisuallyHiddenProps {
  children: ReactNode
  /** Screen-reader announcements for live regions such as the timer. */
  live?: 'off' | 'polite' | 'assertive'
}

export const VisuallyHidden = ({ children, live }: VisuallyHiddenProps) => (
  <span className={styles.hidden} aria-live={live}>
    {children}
  </span>
)
