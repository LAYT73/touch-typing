import { motion } from 'motion/react'
import { AnimatedNumber, Badge, Button, Card, Kbd, Stat } from '@/shared/ui'
import { formatDuration } from '@/shared/lib/utils'
import { useTranslation } from '@/i18n'
import type { QuoteMeta } from '@/features/words'
import { WpmChart } from '../WpmChart'
import { RecentResults } from '../RecentResults'
import type { Outcome } from '../../model/types'
import styles from './ResultsScreen.module.css'

export interface ResultsScreenProps {
  outcome: Outcome
  /** Human readable test configuration, e.g. "Time · 30s". */
  modeLabel: string
  quote: QuoteMeta | null
  onNext: () => void
  onRepeat: () => void
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const } },
}

export const ResultsScreen = ({
  outcome,
  modeLabel,
  quote,
  onNext,
  onRepeat,
}: ResultsScreenProps) => {
  const { t } = useTranslation()
  const { result, isPersonalBest, previousBest } = outcome
  const { characters } = result

  return (
    <motion.section
      className={styles.screen}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={t('results.title')}
    >
      <motion.header className={styles.header} variants={item}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{t('results.title')}</h2>
          <Badge>{modeLabel}</Badge>
          {isPersonalBest && (
            <Badge tone="accent" icon="trophy">
              {t('results.newRecord')}
            </Badge>
          )}
        </div>
        {/* The numbers live in the stat grid; this sentence is what a screen
            reader announces when the test ends. */}
        <p className={styles.summary} role="status">
          {t('results.summary', {
            wpm: Math.round(result.wpm),
            accuracy: Math.round(result.accuracy),
          })}
        </p>
      </motion.header>

      <motion.div className={styles.hero} variants={item}>
        <Stat
          size="lg"
          tone="accent"
          icon="bolt"
          label={t('stats.wpm')}
          value={<AnimatedNumber value={result.wpm} decimals={0} />}
          hint={
            previousBest === null
              ? undefined
              : `${t('results.personalBest')} ${previousBest.toFixed(0)}`
          }
        />
        <Stat
          size="lg"
          icon="target"
          label={t('stats.accuracy')}
          value={<AnimatedNumber value={result.accuracy} decimals={0} />}
          unit="%"
        />
      </motion.div>

      <motion.div variants={item}>
        <WpmChart timeline={result.timeline} />
      </motion.div>

      <motion.div className={styles.grid} variants={item}>
        <Stat size="sm" label={t('stats.raw')} value={Math.round(result.raw)} />
        <Stat
          size="sm"
          label={t('stats.consistency')}
          value={Math.round(result.consistency)}
          unit="%"
        />
        <Stat
          size="sm"
          label={t('stats.time')}
          value={formatDuration(result.durationMs)}
          unit="s"
        />
        <Stat
          size="sm"
          label={t('stats.characters')}
          value={`${characters.correct.toString()}/${characters.incorrect.toString()}/${characters.extra.toString()}/${characters.missed.toString()}`}
          hint={t('stats.charactersHint')}
        />
      </motion.div>

      {quote && (
        <motion.p className={styles.quote} variants={item}>
          {t('results.quoteBy', { author: quote.author, source: quote.source })}
        </motion.p>
      )}

      <motion.div className={styles.actions} variants={item}>
        <Button variant="primary" icon="arrowRight" iconPosition="end" onClick={onNext}>
          {t('results.next')}
        </Button>
        <Button variant="ghost" icon="restart" onClick={onRepeat}>
          {t('results.repeat')}
        </Button>
        <span className={styles.hints}>
          <Kbd>Tab</Kbd> {t('typing.hintNewText')} · <Kbd>Esc</Kbd> {t('typing.hintRestart')}
        </span>
      </motion.div>

      <motion.div variants={item}>
        <Card as="section" padding="md" className={styles.history}>
          <RecentResults />
        </Card>
      </motion.div>
    </motion.section>
  )
}
