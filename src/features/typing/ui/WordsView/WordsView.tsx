import { Fragment, useCallback, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/shared/lib/utils'
import type { CaretStyle } from '@/shared/config'
import { getWordStatus } from '../../model/selectors'
import type { CaretTarget } from '../../model/selectors'
import { Caret } from './Caret'
import { Word } from './Word'
import { useCaretMotion } from './useCaretMotion'
import { useLineScroll } from './useLineScroll'
import styles from './WordsView.module.css'

export interface WordsViewProps {
  words: string[]
  typed: string[]
  wordIndex: number
  caret: CaretTarget | null
  caretStyle: CaretStyle
  smoothCaret: boolean
  blind: boolean
  /** Dims the text while the surface is not focused. */
  dimmed: boolean
  caretBlinking: boolean
}

/** Renders the text and the caret, scrolling line by line as the user advances. */
export const WordsView = ({
  words,
  typed,
  wordIndex,
  caret,
  caretStyle,
  smoothCaret,
  blind,
  dimmed,
  caretBlinking,
}: WordsViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [caretChar, setCaretChar] = useState<HTMLElement | null>(null)
  const [activeWord, setActiveWord] = useState<HTMLElement | null>(null)

  // Callback refs must stay stable, otherwise every word would re-render.
  const caretCharRef = useCallback((element: HTMLSpanElement | null) => {
    setCaretChar(element)
  }, [])
  const activeWordRef = useCallback((element: HTMLSpanElement | null) => {
    setActiveWord(element)
  }, [])

  const caretMotion = useCaretMotion({
    target: caretChar,
    after: caret?.after ?? false,
    containerRef,
    caretStyle,
    smooth: smoothCaret,
  })
  const scrollOffset = useLineScroll(activeWord, containerRef)

  return (
    <div className={cn(styles.viewport, dimmed && styles.dimmed)}>
      <motion.div ref={containerRef} className={styles.words} style={{ y: scrollOffset }}>
        {words.map((word, index) => {
          const typedWord = typed[index] ?? ''
          const isActive = index === wordIndex

          return (
            // The space between words is a real text node, so the text reads
            // and copies like prose and wraps at word boundaries.
            <Fragment key={`${index.toString()}-${word}`}>
              <Word
                expected={word}
                typed={typedWord}
                status={getWordStatus(index, wordIndex, word, typedWord)}
                active={isActive}
                blind={blind}
                caretCharIndex={isActive ? (caret?.charIndex ?? null) : null}
                caretCharRef={isActive ? caretCharRef : null}
                wordRef={isActive ? activeWordRef : null}
              />{' '}
            </Fragment>
          )
        })}

        <Caret
          motionValues={caretMotion}
          style={caretStyle}
          blinking={caretBlinking}
          hidden={caret === null}
        />
      </motion.div>
    </div>
  )
}
