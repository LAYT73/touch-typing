import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageKey } from '@/shared/lib/storage'
import { DEFAULT_SETTINGS } from './types'
import type { Settings } from './types'

interface SettingsStore {
  settings: Settings
  /** Patch one or more settings at once. */
  update: (patch: Partial<Settings>) => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      update: (patch) => {
        set((state) => ({ settings: { ...state.settings, ...patch } }))
      },
      reset: () => {
        set({ settings: DEFAULT_SETTINGS })
      },
    }),
    {
      name: storageKey('settings'),
      version: 1,
      // Older payloads may miss keys added later, so defaults always win as a base.
      merge: (persisted, current) => {
        const stored = (persisted as { settings?: Partial<Settings> } | undefined)?.settings
        return { ...current, settings: { ...DEFAULT_SETTINGS, ...stored } }
      },
    },
  ),
)

export const useSettings = (): Settings => useSettingsStore((state) => state.settings)

export const useUpdateSettings = (): SettingsStore['update'] =>
  useSettingsStore((state) => state.update)
