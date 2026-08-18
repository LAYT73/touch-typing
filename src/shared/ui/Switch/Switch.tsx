import { useId } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'
import type { StyleableProps } from '../types'
import styles from './Switch.module.css'

export interface SwitchProps extends StyleableProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  disabled?: boolean
}

export const Switch = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: SwitchProps) => {
  const id = useId()
  const descriptionId = description ? `${id}-description` : undefined

  return (
    <div className={cn(styles.row, disabled && styles.disabled, className)}>
      <span className={styles.text}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {description && (
          <span className={styles.description} id={descriptionId}>
            {description}
          </span>
        )}
      </span>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={descriptionId}
        disabled={disabled}
        className={cn(styles.track, checked && styles.trackChecked)}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.thumb} />
      </button>
    </div>
  )
}
