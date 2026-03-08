import type { Prompt, Settings } from '@/shared/types'

const DEFAULT_SETTINGS: Settings = {
  sites: {},
}

export const storage = {
  async getPrompts(): Promise<Prompt[]> {
    const data = await chrome.storage.local.get('prompts')
    return (data.prompts as Prompt[]) || []
  },

  async setPrompts(prompts: Prompt[]): Promise<void> {
    await chrome.storage.local.set({ prompts })
  },

  async getSettings(): Promise<Settings> {
    const data = await chrome.storage.local.get('settings')
    return (data.settings as Settings) || DEFAULT_SETTINGS
  },

  async setSettings(settings: Settings): Promise<void> {
    await chrome.storage.local.set({ settings })
  },

  subscribe(
    callback: (changes: Record<string, chrome.storage.StorageChange>) => void,
  ) {
    chrome.storage.local.onChanged.addListener(callback)
    return () => chrome.storage.local.onChanged.removeListener(callback)
  },
}
