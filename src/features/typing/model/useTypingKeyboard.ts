import type { RefObject } from 'react'
import { useEventListener } from '@/shared/lib/hooks'
import { APP_CONFIG } from '@/shared/config'

export interface TypingKeyHandlers {
  insert: (char: string) => void
  submitWord: () => void
  deleteChar: () => void
  deleteWord: () => void
  /** New text, bound to Tab. */
  newTest: () => void
  /** Same text again, bound to Escape. */
  repeat: () => void
}

export interface UseTypingKeyboardOptions extends TypingKeyHandlers {
  /** The element that must hold focus for keystrokes to count. */
  target: RefObject<HTMLElement | null>
  enabled: boolean
}

/** True for keys that produce exactly one printable character. */
const isPrintable = (event: KeyboardEvent): boolean =>
  [...event.key].length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey

/**
 * Translates raw key events into typing actions.
 *
 * Listening on the typing surface instead of the window keeps shortcuts like
 * space and Tab from reaching buttons elsewhere on the page.
 */
export const useTypingKeyboard = ({
  target,
  enabled,
  insert,
  submitWord,
  deleteChar,
  deleteWord,
  newTest,
  repeat,
}: UseTypingKeyboardOptions): void => {
  useEventListener(
    'keydown',
    (event) => {
      if (!enabled) return

      if (event.key === APP_CONFIG.restartKey) {
        event.preventDefault()
        newTest()
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        repeat()
        return
      }

      if (event.key === 'Backspace') {
        event.preventDefault()
        if (event.ctrlKey || event.altKey) deleteWord()
        else deleteChar()
        return
      }

      if (event.key === ' ') {
        // Otherwise the browser scrolls the page.
        event.preventDefault()
        submitWord()
        return
      }

      if (isPrintable(event)) {
        event.preventDefault()
        insert(event.key)
      }
    },
    target,
  )
}
