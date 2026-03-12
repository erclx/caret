import { useEffect, useMemo, useState } from 'react'

import { useSettings } from '@/shared/hooks/use-settings'

import { InputDetector, type TriggerState } from '../input/detector'
import { startSiteObserver } from '../input/site-observer'

export function useInputDetection(): TriggerState {
  const { settings, isLoading } = useSettings()
  const [triggerState, setTriggerState] = useState<TriggerState>({
    isActive: false,
    rect: null,
    triggerSymbol: '>',
  })

  const detector = useMemo(() => new InputDetector(setTriggerState), [])

  useEffect(() => {
    return () => detector.destroy()
  }, [detector])

  useEffect(() => {
    if (isLoading) return

    const hostname = window.location.hostname
    const siteKey = Object.keys(settings.sites).find((k) =>
      hostname.includes(k),
    )
    const siteSettings = siteKey ? settings.sites[siteKey] : null

    if (siteSettings && !siteSettings.enabled) {
      detector.detach()
      return
    }

    const symbol = siteSettings?.triggerSymbol || '>'
    detector.setTriggerSymbol(symbol)

    let stopped = false

    const stopObserver = startSiteObserver((element) => {
      if (!stopped) {
        detector.attach(element)
      }
    })

    return () => {
      stopped = true
      stopObserver()
      detector.detach()
    }
  }, [detector, settings, isLoading])

  return triggerState
}
