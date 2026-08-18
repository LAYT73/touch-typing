import { motion } from 'motion/react'
import { Tooltip } from '@/shared/ui'
import { useTranslation } from '@/i18n'
import { averageWpm, useHistoryStore, useRecentResults } from '../../model/historyStore'
import styles from './RecentResults.module.css'

const VISIBLE_RESULTS = 10

/** Compact bar chart of the last few results, oldest on the left. */
export const RecentResults = () => {
  const { t, tPlural } = useTranslation()
  const recent = useRecentResults(VISIBLE_RESULTS)
  const total = useHistoryStore((state) => state.results.length)

  if (recent.length === 0) {
    return <p className={styles.empty}>{t('history.empty')}</p>
  }

  const peak = Math.max(...recent.map((result) => result.wpm))
  const ordered = [...recent].reverse()

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h3 className={styles.title}>{t('history.title')}</h3>
        <span className={styles.meta}>
          {tPlural('history.count', total)} · {t('history.average', { wpm: averageWpm(recent) })}
        </span>
      </header>

      <ul className={styles.bars}>
        {ordered.map((result, index) => {
          const label = `${result.wpm.toFixed(0)} ${t('stats.wpm')} · ${result.accuracy.toFixed(0)}%`

          return (
            <li key={result.id} className={styles.barSlot}>
              <Tooltip content={label} className={styles.tooltip}>
                <motion.span
                  className={styles.bar}
                  style={{ height: `${((result.wpm / peak) * 100).toFixed(1)}%` }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  role="img"
                  aria-label={label}
                />
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
