import { Download, HelpCircle, Save, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { usePrompts } from '@/shared/hooks/use-prompts'
import { useSettings } from '@/shared/hooks/use-settings'
import { cn } from '@/shared/utils/cn'
import { testConnection } from '@/shared/utils/github'
import { exportPrompts, parseImport } from '@/shared/utils/io'

const DEFAULT_SITES = ['claude.ai', 'gemini.google.com', 'chatgpt.com']

const SYMBOL_RE = /^[^a-zA-Z0-9\s]$/

type SiteConfig = {
  triggerSymbol: string
  enabled: boolean
}

function isValidTrigger(value: string): boolean {
  return SYMBOL_RE.test(value)
}

type ImportFeedback = { type: 'success' | 'error'; message: string }
type ConnectionStatus = 'unconfigured' | 'connected' | 'error'

type LocalGithub = {
  pat: string
  owner: string
  repo: string
  branch: string
  snippetsPath: string
}

const DEFAULT_GITHUB: LocalGithub = {
  pat: '',
  owner: '',
  repo: '',
  branch: 'main',
  snippetsPath: 'snippets',
}

function FieldLabel({
  htmlFor,
  hint,
  children,
}: {
  htmlFor: string
  hint: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-center gap-1.5'>
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className='text-muted-foreground size-3.5 cursor-default' />
        </TooltipTrigger>
        <TooltipContent
          side='top'
          className='max-w-64 bg-zinc-800 text-xs text-zinc-50 dark:bg-zinc-700 [&>svg]:fill-zinc-800 dark:[&>svg]:fill-zinc-700'
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export default function App() {
  const { settings, isLoading, updateSettings, updateSiteSettings } =
    useSettings()
  const { prompts, importPrompts } = usePrompts()
  const [localSites, setLocalSites] = useState<Record<string, SiteConfig>>({})
  const [localGithub, setLocalGithub] = useState<LocalGithub>(DEFAULT_GITHUB)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSavingGithub, setIsSavingGithub] = useState(false)
  const [isGithubSaved, setIsGithubSaved] = useState(false)
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('unconfigured')
  const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(
    null,
  )
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const githubSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const importTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      if (githubSavedTimerRef.current) clearTimeout(githubSavedTimerRef.current)
      if (importTimerRef.current) clearTimeout(importTimerRef.current)
    }
  }, [])

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

      if (settings.github) {
        setLocalGithub({
          pat: settings.github.pat,
          owner: settings.github.owner,
          repo: settings.github.repo,
          branch: settings.github.branch,
          snippetsPath: settings.github.snippetsPath,
        })
        setConnectionStatus('connected')
      }

      setIsInitialized(true)
    }
  }, [settings, isLoading, isInitialized])

  const hasInvalidTrigger = DEFAULT_SITES.some(
    (site) =>
      localSites[site]?.enabled &&
      !isValidTrigger(localSites[site]?.triggerSymbol),
  )

  function showImportFeedback(type: ImportFeedback['type'], message: string) {
    setImportFeedback({ type, message })
    if (importTimerRef.current) clearTimeout(importTimerRef.current)
    importTimerRef.current = setTimeout(() => setImportFeedback(null), 2500)
  }

  function handleExport() {
    exportPrompts(prompts)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    const text = await file.text()
    const result = parseImport(text)

    if (!result.ok) {
      showImportFeedback('error', result.error)
      return
    }

    if (result.prompts.length === 0) {
      showImportFeedback('error', 'No prompts found in file.')
      return
    }

    const { added, updated } = await importPrompts(result.prompts)
    const total = added + updated
    showImportFeedback(
      'success',
      `Imported ${total} prompt${total !== 1 ? 's' : ''} (${added} added, ${updated} updated).`,
    )
  }

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
      setIsSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setIsSaved(false), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveGithub = async () => {
    setIsSavingGithub(true)
    try {
      const current = await import('@/shared/utils/storage').then((m) =>
        m.storage.getSettings(),
      )
      await updateSettings({
        ...current,
        github: {
          ...current.github,
          ...localGithub,
        },
      })
      const ok = await testConnection(localGithub)
      setConnectionStatus(ok ? 'connected' : 'error')
      setIsGithubSaved(true)
      if (githubSavedTimerRef.current) clearTimeout(githubSavedTimerRef.current)
      githubSavedTimerRef.current = setTimeout(
        () => setIsGithubSaved(false),
        2500,
      )
    } finally {
      setIsSavingGithub(false)
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
        <div className='mb-8 flex items-center gap-3'>
          <img src='/logo.png' alt='' className='size-8' aria-hidden='true' />
          <h1 className='text-3xl font-bold tracking-tight'>Caret settings</h1>
        </div>
        {/* Data section */}
        <div className='border-border bg-card text-card-foreground mb-6 rounded-lg border shadow-xs'>
          <div className='border-border border-b p-6'>
            <h2 className='text-foreground text-sm font-semibold'>Data</h2>
            <p className='text-muted-foreground text-sm'>
              Export your prompts as a backup or restore from a previous export.
            </p>
          </div>
          <div className='flex flex-col gap-3 p-6'>
            <Button
              variant='outline'
              className='w-full justify-start dark:hover:bg-zinc-700 dark:hover:text-white'
              onClick={handleExport}
            >
              <Download className='mr-2 size-4' />
              Export prompts as JSON
            </Button>
            <Button
              variant='outline'
              className='w-full justify-start dark:hover:bg-zinc-700 dark:hover:text-white'
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className='mr-2 size-4' />
              Import prompts from JSON
            </Button>
            <input
              ref={fileInputRef}
              type='file'
              accept='.json'
              className='hidden'
              onChange={handleFileChange}
            />
            {importFeedback && (
              <p
                className={cn(
                  'text-sm',
                  importFeedback.type === 'success'
                    ? 'text-muted-foreground'
                    : 'text-destructive',
                )}
              >
                {importFeedback.message}
              </p>
            )}
          </div>
        </div>

        {/* Trigger symbols section */}
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
          <div className='border-border bg-muted/50 flex items-center justify-end gap-4 rounded-b-lg border-t p-6'>
            <span
              className={cn(
                'text-muted-foreground text-sm transition-opacity duration-500',
                isSaved ? 'opacity-100' : 'opacity-0',
              )}
            >
              Settings saved ✓
            </span>
            <Button
              variant='outline'
              className='dark:hover:bg-zinc-700 dark:hover:text-white'
              onClick={handleSave}
              disabled={isSaving || hasInvalidTrigger}
            >
              <Save className='mr-2 size-4' />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
        {/* GitHub Sync section */}
        <div className='border-border bg-card text-card-foreground mt-6 rounded-lg border shadow-xs'>
          <div className='border-border border-b p-6'>
            <h2 className='text-foreground text-sm font-semibold'>
              GitHub sync
            </h2>
            <p className='text-muted-foreground text-sm'>
              Pull prompts from a GitHub repository. Read-only; GitHub is the
              source of truth.
            </p>
          </div>
          <div className='flex flex-col gap-4 p-6'>
            <div className='flex flex-col gap-2'>
              <FieldLabel
                htmlFor='github-pat'
                hint='Needs read access to repo contents. e.g. ghp_xxxxxxxxxxxx'
              >
                Personal access token
              </FieldLabel>
              <Input
                id='github-pat'
                type='password'
                value={localGithub.pat}
                onChange={(e) =>
                  setLocalGithub((prev) => ({ ...prev, pat: e.target.value }))
                }
                placeholder='ghp_••••••••••••••••••••'
                className='font-mono'
              />
            </div>
            <div className='flex gap-3'>
              <div className='flex flex-1 flex-col gap-1'>
                <FieldLabel
                  htmlFor='github-repo'
                  hint='e.g. octocat/my-snippets'
                >
                  Repository
                </FieldLabel>
                <Input
                  id='github-repo'
                  value={
                    localGithub.owner
                      ? `${localGithub.owner}/${localGithub.repo}`
                      : localGithub.repo
                  }
                  onChange={(e) => {
                    const val = e.target.value
                    const slash = val.indexOf('/')
                    setLocalGithub((prev) => ({
                      ...prev,
                      owner: slash !== -1 ? val.slice(0, slash) : '',
                      repo: slash !== -1 ? val.slice(slash + 1) : val,
                    }))
                  }}
                  placeholder='owner/repo'
                />
              </div>
              <div className='flex flex-1 flex-col gap-1'>
                <FieldLabel htmlFor='github-branch' hint='Defaults to main.'>
                  Branch
                </FieldLabel>
                <Input
                  id='github-branch'
                  value={localGithub.branch}
                  onChange={(e) =>
                    setLocalGithub((prev) => ({
                      ...prev,
                      branch: e.target.value,
                    }))
                  }
                  placeholder='main'
                />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <FieldLabel
                htmlFor='github-path'
                hint='Folder of .md files, relative to the repo root. e.g. snippets or prompts/work'
              >
                Snippets path
              </FieldLabel>
              <Input
                id='github-path'
                value={localGithub.snippetsPath}
                onChange={(e) =>
                  setLocalGithub((prev) => ({
                    ...prev,
                    snippetsPath: e.target.value,
                  }))
                }
                placeholder='snippets'
              />
            </div>
          </div>
          <div className='border-border bg-muted/50 flex items-center gap-4 rounded-b-lg border-t p-6'>
            <Button
              variant='outline'
              className='dark:hover:bg-zinc-700 dark:hover:text-white'
              onClick={handleSaveGithub}
              disabled={isSavingGithub}
            >
              <Save className='mr-2 size-4' />
              {isSavingGithub ? 'Saving...' : 'Save'}
            </Button>
            <div className='flex items-center gap-1.5'>
              <span
                className={cn('size-2 rounded-full', {
                  'bg-green-500': connectionStatus === 'connected',
                  'bg-red-500': connectionStatus === 'error',
                  'bg-zinc-400': connectionStatus === 'unconfigured',
                })}
              />
              <span className='text-muted-foreground text-xs'>
                {connectionStatus === 'connected'
                  ? 'Connected'
                  : connectionStatus === 'error'
                    ? 'Error'
                    : 'Not configured'}
              </span>
            </div>
            <span
              className={cn(
                'text-muted-foreground ml-auto text-sm transition-opacity duration-500',
                isGithubSaved ? 'opacity-100' : 'opacity-0',
              )}
            >
              Saved ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
