import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import type { StyleableProps } from '../types'

export interface AnimatedNumberProps extends StyleableProps {
  value: number
  decimals?: number
  /** Duration in seconds. */
  duration?: number
}

/** Counts up to `value` on mount and on every change. */
export const AnimatedNumber = ({
  value,
  decimals = 0,
  duration = 0.8,
  className,
}: AnimatedNumberProps) => {
  const progress = useMotionValue(0)
  const text = useTransform(progress, (current) => current.toFixed(decimals))
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion) {
      progress.set(value)
      return
    }

    const controls = animate(progress, value, { duration, ease: [0.22, 1, 0.36, 1] })
    return () => {
      controls.stop()
    }
  }, [value, duration, prefersReducedMotion, progress])

  return (
    <motion.span className={className} aria-label={value.toFixed(decimals)}>
      {text}
    </motion.span>
  )
}
