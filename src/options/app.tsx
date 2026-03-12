import { Save } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useSettings } from '@/shared/hooks/use-settings'

const DEFAULT_SITES = ['claude.ai', 'gemini.google.com', 'chatgpt.com']

const SYMBOL_RE = /^[^a-zA-Z0-9\s]$/

type SiteConfig = {
  triggerSymbol: string
  enabled: boolean
}

function isValidTrigger(value: string): boolean {
  return SYMBOL_RE.test(value)
}

export default function App() {
  const { settings, isLoading, updateSiteSettings } = useSettings()
  const [localSites, setLocalSites] = useState<Record<string, SiteConfig>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!isLoading && !isInitialized) {
      const initialSites: Record<string, SiteConfig> = {}
      DEFAULT_SITES.forEach((site) => {
        initialSites[site] = settings.sites[site] || {
          triggerSymbol: '>',
          enabled: true,
        }
      })
      setLocalSites(initialSites)
      setIsInitialized(true)
    }
  }, [settings, isLoading, isInitialized])

  const hasInvalidTrigger = DEFAULT_SITES.some(
    (site) =>
      localSites[site]?.enabled &&
      !isValidTrigger(localSites[site]?.triggerSymbol),
  )

  const handleSave = async () => {
    if (hasInvalidTrigger) return
    setIsSaving(true)
    try {
      const promises = Object.entries(localSites)
        .filter(([site, config]) => {
          const original = settings.sites[site] || {
            triggerSymbol: '>',
            enabled: true,
          }
          return (
            config.triggerSymbol !== original.triggerSymbol ||
            config.enabled !== original.enabled
          )
        })
        .map(([site, config]) => updateSiteSettings(site, config))
      await Promise.all(promises)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (
    site: string,
    field: keyof SiteConfig,
    value: string | boolean,
  ) => {
    setLocalSites((prev) => ({
      ...prev,
      [site]: {
        ...prev[site],
        [field]: value,
      },
    }))
  }

  if (isLoading || !isInitialized) {
    return (
      <div className='flex min-h-screen items-center justify-center p-8'>
        <p className='text-muted-foreground'>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className='bg-background text-foreground min-h-screen p-8'>
      <div className='mx-auto max-w-3xl'>
        <h1 className='mb-8 text-3xl font-bold tracking-tight'>
          Caret settings
        </h1>
        <div className='border-border bg-card text-card-foreground rounded-lg border shadow-xs'>
          <div className='border-border border-b p-6'>
            <h2 className='text-muted-foreground text-sm font-semibold'>
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
              const triggerInvalid =
                config?.enabled && !isValidTrigger(config?.triggerSymbol)

              return (
                <div
                  key={site}
                  className='border-border bg-background flex flex-col justify-between gap-4 rounded-md border p-5 sm:flex-row sm:items-center'
                >
                  <div className='flex flex-col gap-2'>
                    <Label className='text-base font-medium'>{site}</Label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        id={`enable-${site}`}
                        aria-label={`Enable Caret on ${site}`}
                        checked={config?.enabled ?? true}
                        onChange={(e) =>
                          handleChange(site, 'enabled', e.target.checked)
                        }
                        className='border-input accent-primary size-4 rounded bg-transparent'
                      />
                      <Label
                        htmlFor={`enable-${site}`}
                        className='text-muted-foreground text-sm font-normal'
                      >
                        Enable Caret on this site
                      </Label>
                    </div>
                  </div>
                  <div className='flex w-full flex-col gap-1 sm:w-32'>
                    <Label
                      htmlFor={`trigger-${site}`}
                      className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'
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
                      maxLength={1}
                      disabled={!(config?.enabled ?? true)}
                      aria-invalid={triggerInvalid}
                      className='text-center font-mono'
                    />
                    {triggerInvalid && (
                      <p className='text-xs text-red-600 dark:text-red-400'>
                        must be a single symbol
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <div className='border-border bg-muted/50 flex justify-end rounded-b-lg border-t p-6'>
            <Button
              onClick={handleSave}
              disabled={isSaving || hasInvalidTrigger}
            >
              <Save className='mr-2 size-4' />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
