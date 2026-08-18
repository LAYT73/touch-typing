import { cn } from '@/shared/lib/utils'
import type { StyleableProps } from '../types'
import styles from './Spinner.module.css'

export interface SpinnerProps extends StyleableProps {
  label: string
  size?: 'sm' | 'md'
}

export const Spinner = ({ label, size = 'md', className }: SpinnerProps) => (
  <span className={cn(styles.spinner, styles[size], className)} role="status" aria-label={label} />
)
