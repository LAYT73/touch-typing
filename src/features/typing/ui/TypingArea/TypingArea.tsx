import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useTranslation } from '@/i18n'
import type { CaretStyle } from '@/shared/config'
import { useTypingKeyboard } from '../../model/useTypingKeyboard'
import type { TypingKeyHandlers } from '../../model/useTypingKeyboard'
import type { CaretTarget } from '../../model/selectors'
import type { SessionStatus } from '../../model/types'
import { FocusOverlay } from '../FocusOverlay'
import { WordsView } from '../WordsView'
import styles from './TypingArea.module.css'

export interface TypingAreaProps extends TypingKeyHandlers {
  words: string[]
  typed: string[]
  wordIndex: number
  status: SessionStatus
  caret: CaretTarget | null
  caretStyle: CaretStyle
  smoothCaret: boolean
  blindMode: boolean
  /** False while data is loading or a dialog is open. */
  enabled: boolean
}

/**
 * The focusable typing surface: owns focus handling and key bindings, and
 * delegates rendering of the text to `WordsView`.
 */
export const TypingArea = ({
  words,
  typed,
  wordIndex,
  status,
  caret,
  caretStyle,
  smoothCaret,
  blindMode,
  enabled,
  ...handlers
}: TypingAreaProps) => {
  const { t } = useTranslation()
  const surfaceRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)

  useTypingKeyboard({ target: surfaceRef, enabled: enabled && focused, ...handlers })

  // Grab focus as soon as the surface can accept keystrokes, and again whenever
  // a new text arrives, so a restart never needs an extra click.
  useEffect(() => {
    if (enabled) surfaceRef.current?.focus()
  }, [enabled, words])

  return (
    <div
      ref={surfaceRef}
      className={styles.surface}
      tabIndex={0}
      role="group"
      aria-label={t('typing.regionLabel')}
      aria-describedby="typing-hints"
      onFocus={() => {
        setFocused(true)
      }}
      onBlur={() => {
        setFocused(false)
      }}
    >
      <WordsView
        words={words}
        typed={typed}
        wordIndex={wordIndex}
        caret={caret}
        caretStyle={caretStyle}
        smoothCaret={smoothCaret}
        blind={blindMode}
        dimmed={!focused}
        caretBlinking={status !== 'running'}
      />

      <AnimatePresence>{!focused && <FocusOverlay />}</AnimatePresence>
    </div>
  )
}
