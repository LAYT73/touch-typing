import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: IconName
  iconPosition?: 'start' | 'end'
  fullWidth?: boolean
  children?: ReactNode
}

export const Button = ({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'start',
  fullWidth = false,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) => {
  const iconNode = icon ? <Icon name={icon} size="1.15em" /> : null

  return (
    <button
      type={type}
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      {...rest}
    >
      {iconPosition === 'start' && iconNode}
      {children != null && <span className={styles.label}>{children}</span>}
      {iconPosition === 'end' && iconNode}
    </button>
  )
}
