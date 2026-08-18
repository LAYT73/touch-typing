import { useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Card } from '@/shared/ui'
import { useEventListener } from '@/shared/lib/hooks'
import { APP_CONFIG } from '@/shared/config'
import { useTranslation } from '@/i18n'
import { TestToolbar, useSettings, useUpdateSettings } from '@/features/settings'
import { useTestText } from '@/features/words'
import { LiveStats, TypingArea, selectNextChar, useTypingTest } from '@/features/typing'
import { ResultsScreen } from '@/features/results'
import { VirtualKeyboard } from '@/features/keyboard'
import { TextPlaceholder } from './TextPlaceholder'
import { TypingHints } from './TypingHints'
import { formatModeLabel } from './modeLabel'
import { useTestOutcome } from './useTestOutcome'
import styles from './TypingTest.module.css'

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
}

export interface TypingTestProps {
  /** Typing pauses while the settings dialog is open. */
  settingsOpen: boolean
  onOpenSettings: () => void
}

/**
 * Composition root of the trainer: connects settings, the text source, the
 * typing session and the result screen. All logic lives in the features it
 * pulls together.
 */
export const TypingTest = ({ settingsOpen, onOpenSettings }: TypingTestProps) => {
  const { t } = useTranslation()
  const settings = useSettings()
  const updateSettings = useUpdateSettings()

  const { status, text, regenerate, retry, extend } = useTestText(settings)
  const { outcome, record, clear } = useTestOutcome(settings)

  const test = useTypingTest({
    words: text?.words ?? null,
    timeLimitSeconds: settings.mode === 'time' ? settings.timeSeconds : null,
    extend: text?.extendable === true ? extend : null,
    onFinish: record,
  })

  const startNewTest = useCallback(() => {
    clear()
    regenerate()
  }, [clear, regenerate])

  const repeatTest = useCallback(() => {
    clear()
    test.repeat()
  }, [clear, test])

  // The typing surface is unmounted while results are shown, so the result
  // screen needs its own shortcuts.
  useEventListener('keydown', (event) => {
    if (!outcome || settingsOpen) return

    if (event.key === APP_CONFIG.restartKey) {
      event.preventDefault()
      startNewTest()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      repeatTest()
    }
  })

  const { state } = test
  const typingReady = status === 'ready' && text !== null

  return (
    <div className={styles.test}>
      <TestToolbar
        settings={settings}
        onChange={updateSettings}
        onRestart={startNewTest}
        onOpenSettings={onOpenSettings}
      />

      <Card as="section" padding="lg" highlighted className={styles.stage}>
        <AnimatePresence mode="wait" initial={false}>
          {outcome ? (
            <motion.div key="results" {...fade}>
              <ResultsScreen
                outcome={outcome}
                modeLabel={formatModeLabel(settings, t)}
                quote={text?.quote ?? null}
                onNext={startNewTest}
                onRepeat={repeatTest}
              />
            </motion.div>
          ) : typingReady ? (
            <motion.div key="typing" className={styles.typing} {...fade}>
              <LiveStats
                stats={test.liveStats}
                timeLeftMs={test.timeLeftMs}
                elapsedMs={test.elapsedMs}
                progress={test.progress}
                wordsTyped={state.wordIndex}
                totalWords={state.words.length}
                visible={settings.showLiveStats}
                timed={settings.mode === 'time'}
              />

              <TypingArea
                words={state.words}
                typed={state.typed}
                wordIndex={state.wordIndex}
                status={state.status}
                caret={test.caret}
                caretStyle={settings.caretStyle}
                smoothCaret={settings.smoothCaret}
                blindMode={settings.blindMode}
                enabled={!settingsOpen}
                insert={test.insert}
                submitWord={test.submitWord}
                deleteChar={test.deleteChar}
                deleteWord={test.deleteWord}
                newTest={startNewTest}
                repeat={repeatTest}
              />
            </motion.div>
          ) : (
            <motion.div key="placeholder" {...fade}>
              <TextPlaceholder state={status === 'error' ? 'error' : 'loading'} onRetry={retry} />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <AnimatePresence>
        {settings.showKeyboard && !outcome && <VirtualKeyboard nextChar={selectNextChar(state)} />}
      </AnimatePresence>

      <TypingHints />
    </div>
  )
}
