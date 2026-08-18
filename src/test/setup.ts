import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// jsdom implements neither API, but the typing surface and the UI kit use both.
if (typeof globalThis.matchMedia !== 'function') {
  globalThis.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })
}

if (typeof globalThis.ResizeObserver !== 'function') {
  globalThis.ResizeObserver = class ResizeObserverStub implements ResizeObserver {
    observe(): void {
      return
    }

    unobserve(): void {
      return
    }

    disconnect(): void {
      return
    }
  }
}

afterEach(() => {
  cleanup()
})
