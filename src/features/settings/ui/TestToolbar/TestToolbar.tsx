import { AnimatePresence, motion } from 'motion/react'
import { IconButton, SegmentedControl } from '@/shared/ui'
import type { SegmentedOption } from '@/shared/ui'
import { QUOTE_LENGTHS, TEST_MODES, TIME_OPTIONS, WORD_COUNT_OPTIONS } from '@/shared/config'
import type { QuoteLength, TestMode, TimeOption, WordCountOption } from '@/shared/config'
import { useTranslation } from '@/i18n'
import type { Settings } from '../../model/types'
import styles from './TestToolbar.module.css'

export interface TestToolbarProps {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onRestart: () => void
  onOpenSettings: () => void
}

const MODE_ICONS = { time: 'clock', words: 'text', quote: 'quote' } as const

/** Mode picker, test length picker and the text modifiers. */
export const TestToolbar = ({
  settings,
  onChange,
  onRestart,
  onOpenSettings,
}: TestToolbarProps) => {
  const { t } = useTranslation()

  const modeOptions: Array<SegmentedOption<TestMode>> = TEST_MODES.map((mode) => ({
    value: mode,
    label: t(`mode.${mode}`),
    icon: MODE_ICONS[mode],
  }))

  const timeOptions: Array<SegmentedOption<TimeOption>> = TIME_OPTIONS.map((seconds) => ({
    value: seconds,
    label: t('mode.timeValue', { seconds }),
  }))

  const wordOptions: Array<SegmentedOption<WordCountOption>> = WORD_COUNT_OPTIONS.map((count) => ({
    value: count,
    label: t('mode.wordsValue', { count }),
  }))

  const quoteOptions: Array<SegmentedOption<QuoteLength>> = QUOTE_LENGTHS.map((length) => ({
    value: length,
    label: t(`quoteLength.${length}`),
  }))

  return (
    <div className={styles.toolbar}>
      <SegmentedControl
        size="sm"
        label={t('mode.label')}
        options={modeOptions}
        value={settings.mode}
        onChange={(mode) => {
          onChange({ mode })
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={settings.mode}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.16 }}
        >
          {settings.mode === 'time' && (
            <SegmentedControl
              size="sm"
              label={t('mode.valueLabel')}
              options={timeOptions}
              value={settings.timeSeconds}
              onChange={(timeSeconds) => {
                onChange({ timeSeconds })
              }}
            />
          )}
          {settings.mode === 'words' && (
            <SegmentedControl
              size="sm"
              label={t('mode.valueLabel')}
              options={wordOptions}
              value={settings.wordCount}
              onChange={(wordCount) => {
                onChange({ wordCount })
              }}
            />
          )}
          {settings.mode === 'quote' && (
            <SegmentedControl
              size="sm"
              label={t('mode.valueLabel')}
              options={quoteOptions}
              value={settings.quoteLength}
              onChange={(quoteLength) => {
                onChange({ quoteLength })
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className={styles.modifiers}>
        {settings.mode !== 'quote' && (
          <>
            <IconButton
              icon="atSign"
              size="sm"
              label={t('options.punctuation')}
              active={settings.punctuation}
              onClick={() => {
                onChange({ punctuation: !settings.punctuation })
              }}
            />
            <IconButton
              icon="hash"
              size="sm"
              label={t('options.numbers')}
              active={settings.numbers}
              onClick={() => {
                onChange({ numbers: !settings.numbers })
              }}
            />
          </>
        )}

        <IconButton icon="restart" size="sm" label={t('typing.restart')} onClick={onRestart} />
        <IconButton
          icon="sliders"
          size="sm"
          label={t('header.settings')}
          onClick={onOpenSettings}
        />
      </div>
    </div>
  )
}
