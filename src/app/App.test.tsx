import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSettingsStore } from '@/features/settings'
import { App } from './App'
import { AppProviders } from './providers/AppProviders'

const renderApp = () =>
  render(
    <AppProviders>
      <App />
    </AppProviders>,
  )

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    useSettingsStore.getState().reset()
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve('alpha\nbravo\ncharlie'),
        } as Response),
      ),
    )
  })

  it('renders the shell in English by default', async () => {
    renderApp()

    expect(screen.getByText('Touch typing practice in English')).toBeInTheDocument()
    expect(await screen.findByRole('group', { name: 'Typing test' })).toBeInTheDocument()
  })

  it('switches the interface to Russian', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getAllByRole('radio', { name: 'RU' })[0]!)

    expect(await screen.findByText('Тренировка слепой печати на английском')).toBeInTheDocument()
    expect(localStorage.getItem('typeflow:locale')).toBe(JSON.stringify('ru'))
  })

  it('opens the settings dialog and applies a change', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('button', { name: 'Settings' }))

    const dialog = await screen.findByRole('dialog', { name: 'Settings' })
    await user.click(screen.getByRole('switch', { name: /Blind mode/ }))
    expect(useSettingsStore.getState().settings.blindMode).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Close settings' }))
    // The dialog fades out, so it leaves the tree a frame later.
    await waitFor(() => {
      expect(dialog).not.toBeInTheDocument()
    })
  })
})
