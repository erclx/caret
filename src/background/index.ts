import { SEED_PROMPTS } from '@/shared/utils/seeds'
import { storage } from '@/shared/utils/storage'

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId })
})

chrome.runtime.onInstalled.addListener(async () => {
  if (import.meta.env.MODE === 'development') {
    const prompts = await storage.getPrompts()
    if (prompts.length === 0) {
      await storage.setPrompts(SEED_PROMPTS)
    }

    const settings = await storage.getSettings()
    if (!settings.github && import.meta.env.VITE_GITHUB_PAT) {
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
