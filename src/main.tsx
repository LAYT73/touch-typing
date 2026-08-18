import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, AppProviders } from '@/app'
import '@/shared/styles/index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root is missing from index.html')

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
