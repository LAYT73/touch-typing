import { motion } from 'motion/react'
import { Icon, IconButton, SegmentedControl } from '@/shared/ui'
import type { SegmentedOption } from '@/shared/ui'
import { APP_CONFIG } from '@/shared/config'
import { LOCALES, LOCALE_SHORT_LABELS, useTranslation } from '@/i18n'
import type { Locale } from '@/i18n'
import styles from './Header.module.css'

export interface HeaderProps {
  onOpenSettings: () => void
}

export const Header = ({ onOpenSettings }: HeaderProps) => {
  const { t, locale, setLocale } = useTranslation()

  const localeOptions: Array<SegmentedOption<Locale>> = LOCALES.map((value) => ({
    value,
    label: LOCALE_SHORT_LABELS[value],
  }))

  return (
    <header className={styles.header}>
      <motion.a
        className={styles.brand}
        href={APP_CONFIG.repositoryUrl}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={styles.mark}>
          <Icon name="bolt" size="1.1rem" />
        </span>
        <span className={styles.wordmark}>
          <span className={styles.name}>{APP_CONFIG.name}</span>
          <span className={styles.tagline}>{t('app.tagline')}</span>
        </span>
      </motion.a>

      <nav className={styles.nav} aria-label={t('app.name')}>
        <SegmentedControl
          size="sm"
          label={t('header.language')}
          options={localeOptions}
          value={locale}
          onChange={setLocale}
        />
        <IconButton icon="sliders" label={t('header.settings')} onClick={onOpenSettings} />
        <a
          className={styles.iconLink}
          href={APP_CONFIG.repositoryUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t('header.source')}
          title={t('header.source')}
        >
          <Icon name="github" size="1.15rem" />
        </a>
      </nav>
    </header>
  )
}
