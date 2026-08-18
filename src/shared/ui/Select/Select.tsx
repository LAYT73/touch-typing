import { useId } from 'react'
import { cn } from '@/shared/lib/utils'
import { Icon } from '../Icon'
import type { StyleableProps } from '../types'
import styles from './Select.module.css'

export interface SelectOption<TValue extends string> {
  value: TValue
  label: string
}

export interface SelectProps<TValue extends string> extends StyleableProps {
  options: ReadonlyArray<SelectOption<TValue>>
  value: TValue
  onChange: (value: TValue) => void
  label: string
  /** Renders the label above the control instead of only exposing it to AT. */
  showLabel?: boolean
  disabled?: boolean
}

/**
 * Styled wrapper around a native `<select>`: keeps platform keyboard support
 * and mobile pickers for free.
 */
export const Select = <TValue extends string>({
  options,
  value,
  onChange,
  label,
  showLabel = false,
  disabled = false,
  className,
}: SelectProps<TValue>) => {
  const id = useId()

  return (
    <div className={cn(styles.wrapper, className)}>
      <label className={cn(styles.label, !showLabel && styles.labelHidden)} htmlFor={id}>
        {label}
      </label>

      <div className={styles.control}>
        <select
          id={id}
          className={styles.select}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as TValue)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" size="1rem" className={styles.chevron} />
      </div>
    </div>
  )
}
