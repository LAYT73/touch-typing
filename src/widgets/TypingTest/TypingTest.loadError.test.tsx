import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppProviders } from '@/app/providers/AppProviders'
import { TypingTest } from './TypingTest'

/**
 * Successful requests are cached for the lifetime of the module, so the failure
 * path needs a file of its own: any earlier test that loaded a word list would
 * otherwise satisfy this one from the cache.
 */
describe('TypingTest without data', () => {
  it('offers a retry when the word list cannot be loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 404 } as Response)),
    )

    render(
      <AppProviders>
        <TypingTest settingsOpen={false} onOpenSettings={vi.fn()} />
      </AppProviders>,
    )

    expect(await screen.findByText('Could not load the text data.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
