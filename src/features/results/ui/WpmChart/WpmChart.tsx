import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useTranslation } from '@/i18n'
import type { TimelinePoint } from '@/features/typing'
import { buildChartGeometry, chartAreaPath, chartPath } from '../../lib/chartGeometry'
import styles from './WpmChart.module.css'

export interface WpmChartProps {
  timeline: TimelinePoint[]
}

/** Coordinate space of the chart; CSS scales it to the available width. */
const VIEWBOX = { width: 640, height: 180, padding: 12 }

export const WpmChart = ({ timeline }: WpmChartProps) => {
  const { t } = useTranslation()
  const gradientId = useId()
  const prefersReducedMotion = useReducedMotion()

  const geometry = buildChartGeometry(timeline, VIEWBOX)
  const draw = prefersReducedMotion ? { duration: 0 } : { duration: 0.9, ease: 'easeOut' as const }

  return (
    <figure className={styles.figure}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${VIEWBOX.width.toString()} ${VIEWBOX.height.toString()}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={t('results.chartLabel')}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
          </linearGradient>
        </defs>

        {geometry.gridLines.map((line) => (
          <g key={line.value}>
            <line
              className={styles.grid}
              x1={VIEWBOX.padding}
              x2={VIEWBOX.width - VIEWBOX.padding}
              y1={line.y}
              y2={line.y}
              vectorEffect="non-scaling-stroke"
            />
          </g>
        ))}

        <motion.path
          className={styles.area}
          d={chartAreaPath(geometry.wpm, VIEWBOX.height, VIEWBOX.padding)}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: 0.2 }}
        />

        <motion.path
          className={styles.rawLine}
          d={chartPath(geometry.raw)}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={draw}
        />

        <motion.path
          className={styles.wpmLine}
          d={chartPath(geometry.wpm)}
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={draw}
        />

        {geometry.errors.map((point) => (
          <motion.circle
            key={point.second}
            className={styles.error}
            cx={point.x}
            cy={point.y}
            r={3}
            vectorEffect="non-scaling-stroke"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: prefersReducedMotion ? 0 : 0.7, duration: 0.25 }}
          />
        ))}
      </svg>

      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchWpm}`} />
          {t('results.chartWpm')}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchRaw}`} />
          {t('results.chartRaw')}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchError}`} />
          {t('results.chartErrors')}
        </span>
        <span className={styles.axis}>
          {geometry.maxValue} {t('stats.wpm')} · {geometry.lastSecond}
          {t('stats.seconds')}
        </span>
      </figcaption>
    </figure>
  )
}
