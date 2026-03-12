import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import cssText from '@/index.css?inline'

import { App } from './views/app'

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)

const shadowRoot = container.attachShadow({ mode: 'open' })

const shadowSheet = new CSSStyleSheet()
shadowSheet.replaceSync(cssText.replace(/:root/g, ':host'))

const globalSheet = new CSSStyleSheet()
for (const rule of shadowSheet.cssRules) {
  if (rule instanceof CSSPropertyRule) {
    globalSheet.insertRule(rule.cssText)
  }
}
document.adoptedStyleSheets = [...document.adoptedStyleSheets, globalSheet]
shadowRoot.adoptedStyleSheets = [shadowSheet]

function syncDarkMode() {
  const isDark =
    document.documentElement.classList.contains('dark') ||
    document.documentElement.getAttribute('data-theme') === 'dark' ||
    document.documentElement.getAttribute('data-color-scheme') === 'dark'
  container.classList.toggle('dark', isDark)
}

syncDarkMode()

new MutationObserver(syncDarkMode).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class', 'data-theme', 'data-color-scheme'],
})

const mountPoint = document.createElement('div')
shadowRoot.appendChild(mountPoint)

createRoot(mountPoint).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
