import { memo } from 'react'
import { cn } from '@/shared/lib/utils'
import { buildWordChars } from '../../model/selectors'
import type { CharStatus, WordStatus } from '../../model/types'
import styles from './WordsView.module.css'

export interface WordProps {
  expected: string
  typed: string
  status: WordStatus
  /** Hides mistakes until the test is over. */
  blind: boolean
  /** Index of the character the caret is attached to, or `null`. */
  caretCharIndex: number | null
  caretCharRef: ((element: HTMLSpanElement | null) => void) | null
  wordRef: ((element: HTMLSpanElement | null) => void) | null
}

/** In blind mode every keystroke looks correct while typing. */
const visualStatus = (status: CharStatus, blind: boolean): CharStatus => {
  if (!blind) return status
  if (status === 'incorrect' || status === 'extra') return 'correct'
  if (status === 'missed') return 'pending'
  return status
}

const WordView = ({
  expected,
  typed,
  status,
  blind,
  caretCharIndex,
  caretCharRef,
  wordRef,
}: WordProps) => {
  const submitted = status === 'correct' || status === 'incorrect'
  const chars = buildWordChars(expected, typed, submitted)
  const flawed = status === 'incorrect' && !blind

  return (
    <span ref={wordRef} className={cn(styles.word, flawed && styles.wordFlawed)}>
      {chars.map((char, index) => (
        <span
          // Characters are identified by position: the caret and the styling
          // both follow the index, never the glyph.
          key={index}
          ref={index === caretCharIndex ? caretCharRef : undefined}
          className={cn(styles.char, styles[visualStatus(char.status, blind)])}
        >
          {char.char}
        </span>
      ))}
    </span>
  )
}

/**
 * Only the active word changes between keystrokes, so memoising here keeps a
 * long text from re-rendering on every key.
 */
export const Word = memo(WordView)
