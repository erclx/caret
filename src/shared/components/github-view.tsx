import { RefreshCw } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import type { GithubSettings } from '@/shared/types'
import { cn } from '@/shared/utils/cn'
import type { DiffEntry, DiffResult } from '@/shared/utils/github'

interface GitHubViewProps {
  status: 'idle' | 'fetching' | 'reviewing' | 'applying'
  diff: DiffResult | null
  error: string | null
  config: GithubSettings | undefined
  upToDateCount: number | null
  sync: () => Promise<'up-to-date' | undefined>
  applySync: () => Promise<void>
  cancelSync: () => void
}

function formatSyncTime(ts: number): string {
  const diffMin = Math.floor((Date.now() - ts) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return new Date(ts).toLocaleDateString()
}

export function GitHubView({
  status,
  diff,
  error,
  config,
  upToDateCount,
  sync,
  applySync,
  cancelSync,
}: GitHubViewProps) {
  const [transient, setTransient] = useState<'applied' | 'checked' | null>(null)
  const transientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (transientTimerRef.current) clearTimeout(transientTimerRef.current)
    }
  }, [])

  function showTransient(label: 'applied' | 'checked') {
    setTransient(label)
    if (transientTimerRef.current) clearTimeout(transientTimerRef.current)
    transientTimerRef.current = setTimeout(() => setTransient(null), 2500)
  }

  async function handleSync() {
    const outcome = await sync()
    if (outcome === 'up-to-date') showTransient('checked')
  }

  async function handleApply() {
    await applySync()
    showTransient('applied')
  }

  if (!config) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <button
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded text-sm underline-offset-4 transition-colors outline-none hover:underline focus-visible:ring-2'
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Set up in Options →
        </button>
      </div>
    )
  }

  const totalChanges = diff
    ? diff.added.length + diff.updated.length + diff.removed.length
    : 0

  const statusLine =
    upToDateCount !== null
      ? `Up to date · ${upToDateCount} snippet${upToDateCount !== 1 ? 's' : ''}`
      : config.lastSyncedAt
        ? `Synced ${formatSyncTime(config.lastSyncedAt)} · ${config.lastSyncedCount ?? 0} snippet${config.lastSyncedCount !== 1 ? 's' : ''}`
        : 'Never synced'

  function entryKey(entry: DiffEntry): string {
    return `${entry.label ?? ''}\x00${entry.name}`
  }

  function entryLabel(entry: DiffEntry): ReactNode {
    return entry.label ? (
      <>
        <span className='text-muted-foreground'>{entry.label} · </span>
        {entry.name}
      </>
    ) : (
      entry.name
    )
  }

  return (
    <div className='flex flex-1 flex-col gap-3 overflow-hidden px-0.5'>
      <div className='flex shrink-0 items-center gap-2'>
        <span
          className={cn(
            'size-2 rounded-full',
            config.connectionHealth === 'error' ? 'bg-red-500' : 'bg-green-500',
          )}
        />
        <span className='text-muted-foreground text-xs'>
          {config.owner}/{config.repo}
        </span>
      </div>

      {status === 'reviewing' && diff ? (
        <>
          <p className='text-muted-foreground shrink-0 text-xs'>
            {diff.added.length +
              diff.updated.length +
              diff.removed.length +
              diff.unchanged.length +
              diff.skipped.length}{' '}
            snippets fetched
          </p>
          <div className='flex-1 overflow-y-auto'>
            {totalChanges === 0 && diff.skipped.length === 0 ? (
              <p className='text-muted-foreground text-xs'>
                {diff.unchanged.length} unchanged - nothing to apply
              </p>
            ) : (
              <div className='flex flex-col gap-1'>
                {totalChanges > 0 && (
                  <>
                    <p className='text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase'>
                      Changes
                    </p>
                    {diff.added.map((entry) => (
                      <div
                        key={entryKey(entry)}
                        className='flex items-center gap-2 font-mono text-xs'
                      >
                        <span className='text-green-600 dark:text-green-400'>
                          +
                        </span>
                        <span className='text-foreground'>
                          {entryLabel(entry)}
                        </span>
                        <span className='text-muted-foreground ml-auto'>
                          new
                        </span>
                      </div>
                    ))}
                    {diff.updated.map((entry) => (
                      <div
                        key={entryKey(entry)}
                        className='flex items-center gap-2 font-mono text-xs'
                      >
                        <span className='text-zinc-500'>~</span>
                        <span className='text-foreground'>
                          {entryLabel(entry)}
                        </span>
                        <span className='text-muted-foreground ml-auto'>
                          modified
                        </span>
                      </div>
                    ))}
                    {diff.removed.map((entry) => (
                      <div
                        key={entryKey(entry)}
                        className='flex items-center gap-2 font-mono text-xs'
                      >
                        <span className='text-destructive'>-</span>
                        <span className='text-foreground'>
                          {entryLabel(entry)}
                        </span>
                        <span className='text-muted-foreground ml-auto'>
                          removed
                        </span>
                      </div>
                    ))}
                  </>
                )}
                {diff.skipped.map((entry) => (
                  <div
                    key={entryKey(entry)}
                    className='flex items-center gap-2 font-mono text-xs'
                  >
                    <span className='text-muted-foreground'>·</span>
                    <span className='text-muted-foreground'>
                      {entryLabel(entry)}
                    </span>
                    <span className='text-muted-foreground ml-auto'>
                      kept local
                    </span>
                  </div>
                ))}
                {diff.unchanged.length > 0 && (
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {diff.unchanged.length} unchanged
                  </p>
                )}
              </div>
            )}
          </div>
          <div className='flex shrink-0 gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 dark:hover:bg-zinc-700 dark:hover:text-white'
              onClick={cancelSync}
            >
              Cancel
            </Button>
            <Button
              variant='outline'
              size='sm'
              className='flex-1 dark:hover:bg-zinc-700 dark:hover:text-white'
              onClick={handleApply}
              disabled={totalChanges === 0}
            >
              Apply{' '}
              {totalChanges > 0
                ? `${totalChanges} change${totalChanges !== 1 ? 's' : ''}`
                : ''}
            </Button>
          </div>
        </>
      ) : (
        <>
          <p className='text-muted-foreground shrink-0 text-xs'>{statusLine}</p>
          {error && (
            <p className='text-destructive shrink-0 text-xs'>{error}</p>
          )}
          <div className='flex shrink-0 flex-col gap-2'>
            <Button
              variant='outline'
              className={cn(
                'w-full dark:hover:bg-zinc-700 dark:hover:text-white',
                (status === 'fetching' || status === 'applying') &&
                  'opacity-50',
              )}
              onClick={handleSync}
              disabled={status === 'fetching' || status === 'applying'}
            >
              <RefreshCw
                className={cn(
                  'mr-2 size-4',
                  (status === 'fetching' || status === 'applying') &&
                    'animate-spin',
                )}
              />
              {status === 'applying' ? 'Applying...' : 'Sync now'}
            </Button>
            <span
              aria-hidden={!transient}
              className={cn(
                'text-muted-foreground text-center text-xs transition-opacity duration-500',
                transient ? 'opacity-100' : 'opacity-0',
              )}
            >
              {transient === 'applied' ? 'Applied ✓' : 'Up to date ✓'}
            </span>
          </div>
        </>
      )}
    </div>
  )
}
