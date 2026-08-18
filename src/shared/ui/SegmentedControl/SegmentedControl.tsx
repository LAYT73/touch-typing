import { useId } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import { Icon } from '../Icon'
import type { IconName } from '../Icon'
import type { StyleableProps } from '../types'
import styles from './SegmentedControl.module.css'

export interface SegmentedOption<TValue extends string | number> {
  value: TValue
  label: ReactNode
  icon?: IconName
  title?: string
}

export interface SegmentedControlProps<TValue extends string | number> extends StyleableProps {
  options: ReadonlyArray<SegmentedOption<TValue>>
  value: TValue
  onChange: (value: TValue) => void
  /** Accessible name for the group. */
  label: string
  size?: 'sm' | 'md'
}

/**
 * Radio group styled as a segmented control, with the selection indicator
 * animated between segments via a shared layout animation.
 */
export const SegmentedControl = <TValue extends string | number>({
  options,
  value,
  onChange,
  label,
  size = 'md',
  className,
}: SegmentedControlProps<TValue>) => {
  const layoutId = useId()

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (offset === 0) return

    event.preventDefault()
    const currentIndex = options.findIndex((option) => option.value === value)
    const next = options[(currentIndex + offset + options.length) % options.length]
    if (next) onChange(next.value)
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(styles.group, styles[size], className)}
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            title={option.title}
            className={cn(styles.segment, selected && styles.selected)}
            onClick={() => onChange(option.value)}
          >
            {selected && (
              <motion.span
                layoutId={layoutId}
                className={styles.indicator}
                transition={{ type: 'spring', stiffness: 520, damping: 38, mass: 0.7 }}
              />
            )}
            <span className={styles.content}>
              {option.icon && <Icon name={option.icon} size="1em" />}
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
