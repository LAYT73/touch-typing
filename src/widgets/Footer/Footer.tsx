import { Icon } from '@/shared/ui'
import { APP_CONFIG } from '@/shared/config'
import { useTranslation } from '@/i18n'
import styles from './Footer.module.css'

export const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className={styles.footer}>
      <span>{t('footer.builtWith')}</span>
      <span className={styles.separator} aria-hidden>
        ·
      </span>
      <span>{t('footer.dataSource')}</span>
      <a className={styles.link} href={APP_CONFIG.repositoryUrl} target="_blank" rel="noreferrer">
        <Icon name="github" size="0.95rem" />
        {t('footer.repo')}
      </a>
    </footer>
  )
}
