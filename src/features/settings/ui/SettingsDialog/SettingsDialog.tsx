import { Button, Modal, SegmentedControl, Select, Switch } from '@/shared/ui'
import type { SegmentedOption, SelectOption } from '@/shared/ui'
import { CARET_STYLES, WORD_LIST_IDS } from '@/shared/config'
import type { CaretStyle, WordListId } from '@/shared/config'
import { LOCALES, LOCALE_SHORT_LABELS, useTranslation } from '@/i18n'
import type { Locale } from '@/i18n'
import { useHistoryStore } from '@/features/results'
import { useSettings, useUpdateSettings } from '../../model/settingsStore'
import styles from './SettingsDialog.module.css'

export interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export const SettingsDialog = ({ open, onClose }: SettingsDialogProps) => {
  const { t, locale, setLocale } = useTranslation()
  const settings = useSettings()
  const update = useUpdateSettings()
  const clearHistory = useHistoryStore((state) => state.clear)

  const localeOptions: Array<SegmentedOption<Locale>> = LOCALES.map((value) => ({
    value,
    label: LOCALE_SHORT_LABELS[value],
  }))

  const wordListOptions: Array<SelectOption<WordListId>> = WORD_LIST_IDS.map((id) => ({
    value: id,
    label: t(`settings.wordList.${id === 'english-200' ? 'english200' : 'english1000'}`),
  }))

  const caretOptions: Array<SelectOption<CaretStyle>> = CARET_STYLES.map((style) => ({
    value: style,
    label: t(`settings.caretStyle.${style}`),
  }))

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('settings.title')}
      closeLabel={t('settings.close')}
      footer={
        <Button variant="primary" onClick={onClose}>
          {t('settings.done')}
        </Button>
      }
    >
      <div className={styles.sections}>
        <section className={styles.section}>
          <h3 className={styles.heading}>{t('settings.sectionText')}</h3>

          <Select
            showLabel
            label={t('settings.wordList')}
            options={wordListOptions}
            value={settings.wordListId}
            onChange={(wordListId) => {
              update({ wordListId })
            }}
          />
          <p className={styles.hint}>{t('settings.wordListHint')}</p>

          <Switch
            checked={settings.punctuation}
            onChange={(punctuation) => {
              update({ punctuation })
            }}
            label={t('options.punctuation')}
            description={t('options.punctuationHint')}
          />
          <Switch
            checked={settings.numbers}
            onChange={(numbers) => {
              update({ numbers })
            }}
            label={t('options.numbers')}
            description={t('options.numbersHint')}
          />
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>{t('settings.sectionAppearance')}</h3>

          <div className={styles.row}>
            <span className={styles.rowLabel}>{t('header.language')}</span>
            <SegmentedControl
              size="sm"
              label={t('header.language')}
              options={localeOptions}
              value={locale}
              onChange={setLocale}
            />
          </div>

          <Select
            showLabel
            label={t('settings.caretStyle')}
            options={caretOptions}
            value={settings.caretStyle}
            onChange={(caretStyle) => {
              update({ caretStyle })
            }}
          />

          <Switch
            checked={settings.smoothCaret}
            onChange={(smoothCaret) => {
              update({ smoothCaret })
            }}
            label={t('settings.smoothCaret')}
            description={t('settings.smoothCaretHint')}
          />
          <Switch
            checked={settings.showKeyboard}
            onChange={(showKeyboard) => {
              update({ showKeyboard })
            }}
            label={t('settings.keyboard')}
            description={t('settings.keyboardHint')}
          />
          <Switch
            checked={settings.showLiveStats}
            onChange={(showLiveStats) => {
              update({ showLiveStats })
            }}
            label={t('settings.liveStats')}
            description={t('settings.liveStatsHint')}
          />
          <Switch
            checked={settings.blindMode}
            onChange={(blindMode) => {
              update({ blindMode })
            }}
            label={t('settings.blindMode')}
            description={t('settings.blindModeHint')}
          />
        </section>

        <section className={styles.section}>
          <h3 className={styles.heading}>{t('settings.sectionData')}</h3>

          <div className={styles.row}>
            <span className={styles.text}>
              <span className={styles.rowLabel}>{t('settings.resetProgress')}</span>
              <span className={styles.hint}>{t('settings.resetProgressHint')}</span>
            </span>
            <Button variant="danger" size="sm" onClick={clearHistory}>
              {t('settings.resetProgressAction')}
            </Button>
          </div>
        </section>
      </div>
    </Modal>
  )
}
