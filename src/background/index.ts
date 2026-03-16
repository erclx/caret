import { SEED_PROMPTS } from '@/shared/utils/seeds'
import { storage } from '@/shared/utils/storage'

console.log('[Background] Service Worker Initialized')

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId })
})

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[Background] Extension installed')

  if (import.meta.env.MODE === 'development') {
    const prompts = await storage.getPrompts()
    if (prompts.length === 0) {
      console.log('[Background] Seeding initial prompts for development')
      await storage.setPrompts(SEED_PROMPTS)
    }

    const settings = await storage.getSettings()
    if (!settings.github && import.meta.env.VITE_GITHUB_PAT) {
      console.log('[Background] Seeding GitHub config from env vars')
      await storage.setSettings({
        ...settings,
        github: {
          pat: import.meta.env.VITE_GITHUB_PAT,
          owner: import.meta.env.VITE_GITHUB_OWNER,
          repo: import.meta.env.VITE_GITHUB_REPO,
          branch: import.meta.env.VITE_GITHUB_BRANCH ?? 'main',
          snippetsPath: import.meta.env.VITE_GITHUB_SNIPPETS_PATH ?? 'snippets',
        },
      })
    }
  }
})
