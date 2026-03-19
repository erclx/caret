import { HelpCircle, Save } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import type { Settings } from '@/shared/types'
import { cn } from '@/shared/utils/cn'
import { testConnection, validateOwnerRepo } from '@/shared/utils/github'
import { storage } from '@/shared/utils/storage'

type ConnectionStatus = 'unconfigured' | 'connected' | 'error'

interface LocalGithub {
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

interface FieldLabelProps {
  htmlFor: string
  hint: string
  children: React.ReactNode
}

function FieldLabel({ htmlFor, hint, children }: FieldLabelProps) {
  return (
    <div className='flex items-center gap-1.5'>
      <Label htmlFor={htmlFor}>{children}</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className='text-muted-foreground size-3.5 cursor-default' />
        </TooltipTrigger>
        <TooltipContent
          side='top'
          className='max-w-64 bg-zinc-800 text-xs text-zinc-50 dark:bg-zinc-700'
        >
          {hint}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

interface GithubSectionProps {
  settings: Settings
  updateSettings: (newSettings: Settings) => Promise<void>
}

export function GithubSection({
  settings,
  updateSettings,
}: GithubSectionProps) {
  const [localGithub, setLocalGithub] = useState<LocalGithub>(() => {
    if (settings.github) {
      return {
        pat: settings.github.pat,
        owner: settings.github.owner,
        repo: settings.github.repo,
        branch: settings.github.branch,
        snippetsPath: settings.github.snippetsPath,
      }
    }
    if (
      import.meta.env.MODE === 'development' &&
      import.meta.env.VITE_GITHUB_PAT
    ) {
      return {
        pat: import.meta.env.VITE_GITHUB_PAT as string,
        owner: (import.meta.env.VITE_GITHUB_OWNER as string) ?? '',
        repo: (import.meta.env.VITE_GITHUB_REPO as string) ?? '',
        branch: (import.meta.env.VITE_GITHUB_BRANCH as string) ?? 'main',
        snippetsPath:
          (import.meta.env.VITE_GITHUB_SNIPPETS_PATH as string) ?? 'snippets',
      }
    }
    return DEFAULT_GITHUB
  })
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    () => {
      if (!settings.github) return 'unconfigured'
      return (settings.github.connectionHealth ??
        'connected') as ConnectionStatus
    },
  )
  const [repoError, setRepoError] = useState<string | null>(null)
  const [isRepoBlurred, setRepoBlurred] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isSavingGithub, setIsSavingGithub] = useState(false)
  const [isGithubSaved, setIsGithubSaved] = useState(false)
  const githubSavedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (githubSavedTimerRef.current) clearTimeout(githubSavedTimerRef.current)
    }
  }, [])

  async function handleDisconnect() {
    const current = await storage.getSettings()
    await updateSettings({ sites: current.sites })
    setLocalGithub(DEFAULT_GITHUB)
    setConnectionStatus('unconfigured')
    setConnectionError(null)
    setRepoError(null)
    setRepoBlurred(false)
  }

  async function handleSaveGithub() {
    setIsSavingGithub(true)
    setConnectionError(null)
    try {
      const result = await testConnection(localGithub)
      setConnectionStatus(result.ok ? 'connected' : 'error')
      if (!result.ok) {
        setConnectionError(result.error)
        return
      }

      const current = await storage.getSettings()
      await updateSettings({
        ...current,
        github: {
          ...current.github,
          ...localGithub,
          connectionHealth: 'connected',
        },
      })
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

  return (
    <div className='border-border bg-card text-card-foreground mt-6 rounded-lg border shadow-xs'>
      <div className='border-border border-b p-6'>
        <h2 className='text-foreground text-sm font-semibold'>GitHub sync</h2>
        <p className='text-muted-foreground text-sm'>
          Pull prompts from a GitHub repository. Read-only; GitHub is the source
          of truth.
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
          <a
            href='https://github.com/settings/personal-access-tokens/new'
            target='_blank'
            rel='noreferrer'
            className='text-muted-foreground hover:text-foreground w-fit text-xs underline-offset-2 hover:underline'
          >
            Create a token on GitHub →
          </a>
        </div>
        <div className='flex gap-3'>
          <div className='flex flex-1 flex-col gap-1'>
            <FieldLabel htmlFor='github-repo' hint='e.g. octocat/my-snippets'>
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
                setRepoError(validateOwnerRepo(val))
              }}
              onBlur={(e) => {
                const val = e.target.value.trim()
                const slash = val.indexOf('/')
                setLocalGithub((prev) => ({
                  ...prev,
                  owner: slash !== -1 ? val.slice(0, slash) : '',
                  repo: slash !== -1 ? val.slice(slash + 1) : val,
                }))
                setRepoBlurred(true)
                setRepoError(validateOwnerRepo(val))
              }}
              placeholder='owner/repo'
            />
            {isRepoBlurred && repoError && (
              <p className='text-destructive text-xs'>{repoError}</p>
            )}
          </div>
          <div className='flex flex-1 flex-col gap-1'>
            <FieldLabel htmlFor='github-branch' hint='Defaults to main.'>
              Branch
            </FieldLabel>
            <Input
              id='github-branch'
              value={localGithub.branch}
              onChange={(e) =>
                setLocalGithub((prev) => ({ ...prev, branch: e.target.value }))
              }
              placeholder='main'
            />
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <FieldLabel
            htmlFor='github-path'
            hint='Folder of .md files relative to the repo root. Filename (without .md) becomes the snippet name; non-.md files are skipped. e.g. snippets or prompts/work'
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
      <div className='border-border bg-muted/50 flex flex-col gap-3 rounded-b-lg border-t p-6'>
        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            className='dark:hover:bg-zinc-700 dark:hover:text-white'
            onClick={handleSaveGithub}
            disabled={isSavingGithub || !!repoError}
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
          <div className='ml-auto flex items-center gap-3'>
            <span
              className={cn(
                'text-muted-foreground text-sm transition-opacity duration-500',
                isGithubSaved ? 'opacity-100' : 'opacity-0',
              )}
            >
              Saved ✓
            </span>
            {settings.github && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='text-destructive hover:text-destructive dark:hover:bg-zinc-700'
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side='top'
                  className='max-w-64 bg-zinc-800 text-xs text-zinc-50 dark:bg-zinc-700'
                >
                  Your synced prompts will not be removed.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {connectionError && (
          <p className='text-destructive text-xs'>{connectionError}</p>
        )}
      </div>
    </div>
  )
}
