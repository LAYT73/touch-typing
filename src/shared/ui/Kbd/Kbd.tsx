import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import type { StyleableProps } from '../types'
import styles from './Kbd.module.css'

export interface KbdProps extends StyleableProps {
  children: ReactNode
}

/** Renders a keyboard key, e.g. in hints like "press Tab to restart". */
export const Kbd = ({ children, className }: KbdProps) => (
  <kbd className={cn(styles.kbd, className)}>{children}</kbd>
)
