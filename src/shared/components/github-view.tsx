import { RefreshCw } from 'lucide-react'

import { Button } from '@/shared/components/ui/button'
import { useGithubSync } from '@/shared/hooks/use-github-sync'
import { cn } from '@/shared/utils/cn'

function formatSyncTime(ts: number): string {
  const diffMin = Math.floor((Date.now() - ts) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  return new Date(ts).toLocaleDateString()
}

export function GitHubView() {
  const { status, diff, error, config, sync, applySync, cancelSync } =
    useGithubSync()

  if (!config) {
    return (
      <div className='flex flex-1 items-center justify-center'>
        <button
          className='text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline'
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

  const statusLine = config.lastSyncedAt
    ? `Synced ${formatSyncTime(config.lastSyncedAt)} · ${config.lastSyncedCount ?? 0} snippet${config.lastSyncedCount !== 1 ? 's' : ''}`
    : 'Never synced'

  return (
    <div className='flex flex-1 flex-col gap-3 overflow-hidden'>
      {/* Connection header */}
      <div className='flex shrink-0 items-center gap-2'>
        <span className='size-2 rounded-full bg-green-500' />
        <span className='text-muted-foreground text-xs'>
          {config.owner}/{config.repo}
        </span>
      </div>

      {status === 'reviewing' && diff ? (
        <>
          {/* Diff view */}
          <p className='text-muted-foreground shrink-0 text-xs'>
            {diff.added.length +
              diff.updated.length +
              diff.removed.length +
              diff.unchanged.length}{' '}
            snippets fetched
          </p>
          <div className='flex-1 overflow-y-auto'>
            {totalChanges > 0 ? (
              <div className='flex flex-col gap-1'>
                <p className='text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase'>
                  Changes
                </p>
                {diff.added.map((name) => (
                  <div
                    key={name}
                    className='flex items-center gap-2 font-mono text-xs'
                  >
                    <span className='text-green-600 dark:text-green-400'>
                      +
                    </span>
                    <span className='text-foreground'>{name}</span>
                    <span className='text-muted-foreground ml-auto'>new</span>
                  </div>
                ))}
                {diff.updated.map((name) => (
                  <div
                    key={name}
                    className='flex items-center gap-2 font-mono text-xs'
                  >
                    <span className='text-zinc-500'>~</span>
                    <span className='text-foreground'>{name}</span>
                    <span className='text-muted-foreground ml-auto'>
                      modified
                    </span>
                  </div>
                ))}
                {diff.removed.map((name) => (
                  <div
                    key={name}
                    className='flex items-center gap-2 font-mono text-xs'
                  >
                    <span className='text-destructive'>-</span>
                    <span className='text-foreground'>{name}</span>
                    <span className='text-muted-foreground ml-auto'>
                      removed
                    </span>
                  </div>
                ))}
                {diff.unchanged.length > 0 && (
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {diff.unchanged.length} unchanged
                  </p>
                )}
              </div>
            ) : (
              <p className='text-muted-foreground text-xs'>
                {diff.unchanged.length} unchanged — nothing to apply
              </p>
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
              onClick={applySync}
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
          {/* Idle / fetching / applying */}
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
              onClick={sync}
              disabled={status === 'fetching' || status === 'applying'}
            >
              <RefreshCw
                className={cn(
                  'mr-2 size-4',
                  status === 'fetching' && 'animate-spin',
                )}
              />
              {status === 'fetching'
                ? 'Fetching...'
                : status === 'applying'
                  ? 'Applying...'
                  : 'Sync now'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
