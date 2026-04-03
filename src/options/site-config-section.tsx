import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import type { Settings } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

const DEFAULT_SITES = ['claude.ai', 'gemini.google.com', 'chatgpt.com']

const SYMBOL_RE = /^[^a-zA-Z0-9\s]$/

const SLASH_CONFLICT_SITES = new Set(['claude.ai', 'chatgpt.com'])

interface SiteConfig {
  triggerSymbol: string
  enabled: boolean
}

interface SiteConfigSectionProps {
  settings: Settings
  updateSiteSettings: (
    hostname: string,
    siteSettings: Settings['sites'][string],
  ) => Promise<void>
}

function isValidTrigger(value: string): boolean {
  return SYMBOL_RE.test(value)
}

function isSlashConflict(site: string, symbol: string): boolean {
  return SLASH_CONFLICT_SITES.has(site) && symbol === '/'
}

export function SiteConfigSection({
  settings,
  updateSiteSettings,
}: SiteConfigSectionProps) {
  const [localSites, setLocalSites] = useState<Record<string, SiteConfig>>(
    () => {
      const initial: Record<string, SiteConfig> = {}
      DEFAULT_SITES.forEach((site) => {
        initial[site] = settings.sites[site] || {
          triggerSymbol: '>',
          enabled: true,
        }
      })
      return initial
    },
  )
  const [blurredTriggers, setBlurredTriggers] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastFeedbackRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  const hasInvalidTrigger = DEFAULT_SITES.some(
    (site) =>
      localSites[site]?.enabled &&
      !isValidTrigger(localSites[site]?.triggerSymbol),
  )

  function handleChange(
    site: string,
    field: keyof SiteConfig,
    value: string | boolean,
  ) {
    setLocalSites((prev) => ({
      ...prev,
      [site]: { ...prev[site], [field]: value },
    }))
  }

  function handleTriggerBlur(site: string) {
    setBlurredTriggers((prev) => new Set(prev).add(site))
  }

  function showFeedback(message: string) {
    lastFeedbackRef.current = message
    setSavedFeedback(message)
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    savedTimerRef.current = setTimeout(() => setSavedFeedback(null), 2500)
  }

  async function handleSave() {
    if (hasInvalidTrigger) return

    const changed = Object.entries(localSites).filter(([site, config]) => {
      const original = settings.sites[site] || {
        triggerSymbol: '>',
        enabled: true,
      }
      return (
        config.triggerSymbol !== original.triggerSymbol ||
        config.enabled !== original.enabled
      )
    })

    if (changed.length === 0) {
      showFeedback('No changes')
      return
    }

    setIsSaving(true)
    try {
      await Promise.all(
        changed.map(([site, config]) => updateSiteSettings(site, config)),
      )
      showFeedback('Saved ✓')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='border-border bg-card text-card-foreground rounded-lg border shadow-xs'>
      <div className='border-border border-b p-6'>
        <h2 className='text-foreground text-sm font-semibold'>
          Per-site configuration
        </h2>
        <p className='text-muted-foreground text-sm'>
          Configure the trigger symbol and toggle Caret integration for
          supported AI platforms.
        </p>
      </div>
      <div className='flex flex-col gap-6 p-6'>
        {DEFAULT_SITES.map((site) => {
          const config = localSites[site]
          const isTriggerInvalid =
            blurredTriggers.has(site) &&
            config?.enabled &&
            !isValidTrigger(config?.triggerSymbol)
          const isSlashWarning =
            config?.enabled && isSlashConflict(site, config?.triggerSymbol)

          return (
            <div
              key={site}
              className='border-border bg-background flex flex-col justify-between gap-4 rounded-md border px-6 py-5 sm:flex-row sm:items-center'
            >
              <div className='flex flex-col gap-2'>
                <Label className='text-sm font-medium'>{site}</Label>
                <div className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    id={`enable-${site}`}
                    aria-label={`Enable Caret on ${site}`}
                    checked={config?.enabled ?? true}
                    onChange={(e) =>
                      handleChange(site, 'enabled', e.target.checked)
                    }
                    className='border-input accent-primary focus-visible:ring-ring/50 size-4 rounded bg-transparent outline-none focus-visible:ring-2'
                  />
                  <Label
                    htmlFor={`enable-${site}`}
                    className='text-muted-foreground text-sm font-normal'
                  >
                    Enable Caret on this site
                  </Label>
                </div>
              </div>
              <div className='flex w-full flex-col gap-1 sm:w-20'>
                <Label
                  htmlFor={`trigger-${site}`}
                  className='text-muted-foreground text-xs font-semibold'
                >
                  Trigger
                </Label>
                <Input
                  id={`trigger-${site}`}
                  aria-label={`Trigger symbol for ${site}`}
                  value={config?.triggerSymbol ?? '>'}
                  onChange={(e) =>
                    handleChange(site, 'triggerSymbol', e.target.value)
                  }
                  onBlur={() => handleTriggerBlur(site)}
                  maxLength={1}
                  disabled={!(config?.enabled ?? true)}
                  aria-invalid={isTriggerInvalid}
                  className='text-center font-mono'
                />
                {isTriggerInvalid && (
                  <p className='text-xs text-red-600 dark:text-red-400'>
                    Enter a single non-letter symbol
                  </p>
                )}
                {!isTriggerInvalid && isSlashWarning && (
                  <p className='text-xs text-amber-600 dark:text-amber-400'>
                    / conflicts with this site's native slash menu
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <div className='border-border bg-muted/50 flex items-center gap-4 rounded-b-lg border-t p-6'>
        <Button
          variant='outline'
          className='dark:hover:bg-zinc-700 dark:hover:text-white'
          onClick={handleSave}
          disabled={isSaving || hasInvalidTrigger}
        >
          <Save className='mr-2 size-4' />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <span
          className={cn(
            'text-muted-foreground ml-auto text-sm transition-opacity duration-500',
            savedFeedback !== null ? 'opacity-100' : 'opacity-0',
          )}
        >
          {lastFeedbackRef.current}
        </span>
      </div>
    </div>
  )
}
