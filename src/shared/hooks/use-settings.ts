import { useCallback, useEffect, useState } from 'react'

import type { Settings } from '@/shared/types'
import { storage } from '@/shared/utils/storage'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ sites: {} })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    storage.getSettings().then((data) => {
      if (isMounted) {
        setSettings(data)
        setIsLoading(false)
      }
    })

    const unsubscribe = storage.subscribe((changes) => {
      if (changes.settings && isMounted) {
        setSettings((changes.settings.newValue as Settings) || { sites: {} })
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const updateSettings = useCallback(async (newSettings: Settings) => {
    await storage.setSettings(newSettings)
  }, [])

  const updateSiteSettings = useCallback(
    async (hostname: string, siteSettings: Settings['sites'][string]) => {
      const current = await storage.getSettings()
      const updated: Settings = {
        ...current,
        sites: {
          ...current.sites,
          [hostname]: siteSettings,
        },
      }
      await storage.setSettings(updated)
    },
    [],
  )

  return { settings, isLoading, updateSettings, updateSiteSettings }
}
