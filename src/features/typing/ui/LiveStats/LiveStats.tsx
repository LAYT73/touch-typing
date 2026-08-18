import { AnimatePresence, motion } from 'motion/react'
import { ProgressBar, Stat, VisuallyHidden } from '@/shared/ui'
import { formatDuration } from '@/shared/lib/utils'
import { useTranslation } from '@/i18n'
import type { LiveStats as LiveStatsValue } from '../../model/types'
import styles from './LiveStats.module.css'

export interface LiveStatsProps {
  stats: LiveStatsValue
  /** Remaining time for timed tests. */
  timeLeftMs: number | null
  elapsedMs: number
  progress: number
  /** Words submitted / total, for word and quote tests. */
  wordsTyped: number
  totalWords: number
  visible: boolean
  timed: boolean
}

export const LiveStats = ({
  stats,
  timeLeftMs,
  elapsedMs,
  progress,
  wordsTyped,
  totalWords,
  visible,
  timed,
}: LiveStatsProps) => {
  const { t } = useTranslation()

  const counter = timed
    ? formatDuration(timeLeftMs ?? 0)
    : `${wordsTyped.toString()}/${totalWords.toString()}`

  return (
    <div className={styles.bar}>
      <div className={styles.counter}>
        <span className={styles.counterValue}>{counter}</span>
        <span className={styles.counterLabel}>{timed ? t('stats.timeLeft') : t('mode.words')}</span>
        <VisuallyHidden live="polite">
          {timed ? `${t('stats.timeLeft')}: ${counter}` : `${t('stats.progress')}: ${counter}`}
        </VisuallyHidden>
      </div>

      <AnimatePresence initial={false}>
        {visible && (
          <motion.div
            className={styles.stats}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            <Stat size="sm" label={t('stats.wpm')} value={Math.round(stats.wpm)} tone="accent" />
            <Stat
              size="sm"
              label={t('stats.accuracy')}
              value={Math.round(stats.accuracy)}
              unit="%"
            />
            {!timed && <Stat size="sm" label={t('stats.time')} value={formatDuration(elapsedMs)} />}
          </motion.div>
        )}
      </AnimatePresence>

      <ProgressBar className={styles.progress} value={progress} label={t('stats.progress')} />
    </div>
  )
}
