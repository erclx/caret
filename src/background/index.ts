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
  }
})
