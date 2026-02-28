import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import cssText from '@/index.css?inline'

import App from './views/app.tsx'

console.log('[CRXJS] Hello world from content script!')

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)

const shadowRoot = container.attachShadow({ mode: 'open' })

const style = document.createElement('style')
style.textContent = cssText
shadowRoot.appendChild(style)

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

createRoot(mountPoint).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
