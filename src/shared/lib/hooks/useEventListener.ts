import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

type EventTargetLike = Window | Document | HTMLElement
type Target = EventTargetLike | RefObject<HTMLElement | null> | null

const resolveTarget = (target: Target): EventTargetLike | null => {
  if (!target) return null
  return 'current' in target ? target.current : target
}

/**
 * Attaches a DOM listener without re-subscribing when the handler identity
 * changes: the latest handler is read from a ref at call time.
 *
 * `target` must be referentially stable (`window`, `document` or a ref object).
 */
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  target: Target = typeof window === 'undefined' ? null : window,
  options: AddEventListenerOptions = {},
): void {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  const { capture, passive, once } = options

  useEffect(() => {
    const element = resolveTarget(target)
    if (!element) return

    const listener = (event: Event) => {
      handlerRef.current(event as WindowEventMap[K])
    }

    element.addEventListener(type, listener, {
      capture: capture ?? false,
      passive: passive ?? false,
      once: once ?? false,
    })
    return () => {
      element.removeEventListener(type, listener, { capture: capture ?? false })
    }
  }, [type, target, capture, passive, once])
}
