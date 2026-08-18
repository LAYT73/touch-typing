import { useEffect, useLayoutEffect } from 'react'
import type { RefObject } from 'react'
import { useMotionValue, useSpring } from 'motion/react'
import type { MotionValue } from 'motion/react'
import type { CaretStyle } from '@/shared/config'

export interface CaretMotion {
  x: MotionValue<number>
  y: MotionValue<number>
  width: MotionValue<number>
  height: MotionValue<number>
}

const SPRING = { stiffness: 1500, damping: 70, mass: 0.6 } as const
const LINE_WIDTH = 2
const UNDERLINE_THICKNESS = 2

interface Geometry {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Caret box for a character element, in coordinates of the positioned words
 * container. Offsets are used rather than client rects so the numbers stay
 * valid while that container is translated for line scrolling.
 */
const measure = (target: HTMLElement, after: boolean, caretStyle: CaretStyle): Geometry => {
  const x = target.offsetLeft + (after ? target.offsetWidth : 0)

  if (caretStyle === 'underline') {
    return {
      x,
      y: target.offsetTop + target.offsetHeight - UNDERLINE_THICKNESS,
      width: target.offsetWidth,
      height: UNDERLINE_THICKNESS,
    }
  }

  return {
    x,
    y: target.offsetTop,
    width: caretStyle === 'line' ? LINE_WIDTH : target.offsetWidth,
    height: target.offsetHeight,
  }
}

export interface UseCaretMotionOptions {
  /** The character the caret is attached to. */
  target: HTMLElement | null
  /** True when the caret belongs after that character. */
  after: boolean
  containerRef: RefObject<HTMLElement | null>
  caretStyle: CaretStyle
  smooth: boolean
}

/**
 * Tracks caret geometry in motion values instead of React state, so moving the
 * caret costs no extra render, and animating it stays a spring on the GPU.
 */
export const useCaretMotion = ({
  target,
  after,
  containerRef,
  caretStyle,
  smooth,
}: UseCaretMotionOptions): CaretMotion => {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const width = useMotionValue(0)
  const height = useMotionValue(0)

  const springX = useSpring(rawX, SPRING)
  const springY = useSpring(rawY, SPRING)

  const apply = (element: HTMLElement) => {
    const geometry = measure(element, after, caretStyle)
    rawX.set(geometry.x)
    rawY.set(geometry.y)
    width.set(geometry.width)
    height.set(geometry.height)
  }

  // Runs after every render: the caret follows whatever the last keystroke did.
  useLayoutEffect(() => {
    if (target) apply(target)
  })

  // Text reflows (window resize, font swap) move characters around without
  // changing which element the caret is attached to.
  useEffect(() => {
    const container = containerRef.current
    if (!container || !target) return

    const observer = new ResizeObserver(() => {
      apply(target)
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `apply` reads only motion values and the props below
  }, [containerRef, target, after, caretStyle])

  return { x: smooth ? springX : rawX, y: smooth ? springY : rawY, width, height }
}
