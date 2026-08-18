import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppProviders } from '@/app/providers/AppProviders'
import { useSettingsStore } from '@/features/settings'
import { useHistoryStore } from '@/features/results'
import { TypingTest } from './TypingTest'

const WORDS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot']

/** Serves the word list from memory so the widget can be driven end to end. */
const stubFetch = (): void => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(WORDS.join('\n')),
      } as Response),
    ),
  )
}

const renderTest = () =>
  render(
    <AppProviders>
      <TypingTest settingsOpen={false} onOpenSettings={vi.fn()} />
    </AppProviders>,
  )

/** The words currently on screen, read back from the rendered text. */
const visibleWords = (): string[] => {
  const surface = screen.getByRole('group', { name: 'Typing test' })
  return (surface.textContent ?? '').trim().split(/\s+/).filter(Boolean)
}

describe('TypingTest', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.getState().reset()
    useHistoryStore.getState().clear()
    stubFetch()
  })

  it('loads the word list and shows a text to type', async () => {
    renderTest()

    await waitFor(() => {
      expect(visibleWords().length).toBeGreaterThan(0)
    })

    for (const word of visibleWords()) {
      expect(WORDS).toContain(word)
    }
  })

  it('runs a words test from the first keystroke to the result screen', async () => {
    const user = userEvent.setup()
    useSettingsStore.getState().update({ mode: 'words', wordCount: 10 })

    renderTest()

    await waitFor(() => {
      expect(visibleWords()).toHaveLength(10)
    })

    await user.keyboard(visibleWords().join(' '))

    const results = await screen.findByRole('region', { name: 'Result' })
    expect(results).toHaveTextContent('Words · 10')
    // A flawless run must report full accuracy.
    expect(results).toHaveTextContent('100%')
  })

  it('records the finished test in the history store', async () => {
    const user = userEvent.setup()
    useSettingsStore.getState().update({ mode: 'words', wordCount: 10 })

    renderTest()
    await waitFor(() => {
      expect(visibleWords()).toHaveLength(10)
    })
    await user.keyboard(visibleWords().join(' '))
    await screen.findByRole('region', { name: 'Result' })

    expect(useHistoryStore.getState().results).toHaveLength(1)
  })
})
