import { useEffect, useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'

const SPRING = { stiffness: 260, damping: 34, mass: 0.9 } as const

/**
 * Vertical offset that keeps the active word on the second visible line.
 *
 * Word boxes are exactly one line tall, so the row index is the word's offset
 * divided by its own height. The offset is a motion value: scrolling a line is
 * an animation, not a state change.
 */
export const useLineScroll = (
  activeWord: HTMLElement | null,
  containerRef: RefObject<HTMLElement | null>,
): MotionValue<number> => {
  const offset = useMotionValue(0)
  const smoothOffset = useSpring(offset, SPRING)

  const apply = (element: HTMLElement) => {
    const rowHeight = element.offsetHeight
    if (rowHeight === 0) return

    const row = Math.round(element.offsetTop / rowHeight)
    offset.set(-Math.max(0, (row - 1) * rowHeight))
  }

  useLayoutEffect(() => {
    if (activeWord) apply(activeWord)
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container || !activeWord) return

    const observer = new ResizeObserver(() => {
      apply(activeWord)
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `apply` only writes to a motion value
  }, [containerRef, activeWord])

  return smoothOffset
}
