import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import styles from './IconButton.module.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  /** Required: an icon-only control needs an accessible name. */
  label: string
  size?: 'sm' | 'md'
  /** When defined the button acts as a toggle and reports `aria-pressed`. */
  active?: boolean
}

export const IconButton = ({
  icon,
  label,
  size = 'md',
  active,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) => (
  <button
    type={type}
    className={cn(styles.button, styles[size], active && styles.active, className)}
    aria-label={label}
    title={label}
    aria-pressed={active}
    {...rest}
  >
    <Icon name={icon} size={size === 'sm' ? '1rem' : '1.15rem'} />
  </button>
)
