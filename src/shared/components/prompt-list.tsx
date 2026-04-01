import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { GithubIcon } from '@/shared/components/github-icon'
import { Button } from '@/shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import type { Prompt } from '@/shared/types'

export interface PromptListProps {
  prompts: Prompt[]
  hasActiveFilter: boolean
  hasEverHadPrompts: boolean
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
}

export function PromptList({
  prompts,
  hasActiveFilter,
  hasEverHadPrompts,
  onEdit,
  onDelete,
}: PromptListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (prompts.length === 0) {
    if (hasActiveFilter) {
      return (
        <div className='flex flex-1 flex-col items-center justify-center py-8 text-center'>
          <p className='text-muted-foreground text-sm'>No prompts found.</p>
        </div>
      )
    }
    if (!hasEverHadPrompts) {
      return (
        <div className='flex flex-1 flex-col items-center justify-center py-8 text-center'>
          <p className='text-muted-foreground text-sm'>No prompts yet.</p>
          <p className='text-muted-foreground text-sm'>
            Add one above, then type &gt; in any chat to use it.
          </p>
        </div>
      )
    }
    return (
      <div className='flex flex-1 flex-col items-center justify-center py-8 text-center'>
        <p className='text-muted-foreground text-sm'>
          No prompts yet, click + New to add one.
        </p>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto pb-4'>
      <div className='flex flex-col gap-2'>
        {prompts.map((prompt) => {
          if (confirmDeleteId === prompt.id) {
            return (
              <div
                key={prompt.id}
                className='bg-muted dark:border-border flex items-center justify-between gap-2 rounded-md p-3 dark:border'
              >
                <span className='text-muted-foreground text-sm'>Delete?</span>
                <div className='flex shrink-0 gap-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    className='hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-white'
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={() => {
                      onDelete(prompt.id)
                      setConfirmDeleteId(null)
                    }}
                    aria-label='Confirm delete'
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={prompt.id}
              className='group border-border bg-card hover:border-foreground/40 hover:bg-accent/20 flex cursor-pointer items-center justify-between gap-2 rounded-md border p-3 shadow-sm transition-colors dark:hover:bg-zinc-700/50'
              onClick={() => onEdit(prompt)}
            >
              <div className='flex flex-col overflow-hidden'>
                <span className='text-foreground flex min-w-0 items-center gap-1 text-sm font-medium'>
                  <span className='truncate'>
                    {prompt.label && (
                      <span className='text-muted-foreground'>
                        {prompt.label} ·{' '}
                      </span>
                    )}
                    {prompt.name}
                  </span>
                  {prompt.source === 'github' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          tabIndex={0}
                          className='focus-visible:ring-ring/50 inline-flex shrink-0 rounded outline-none focus-visible:ring-2'
                        >
                          <GithubIcon
                            aria-hidden='true'
                            className='text-muted-foreground size-3'
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side='top'
                        className='bg-zinc-800 text-xs text-zinc-50 dark:bg-zinc-700'
                      >
                        Managed by GitHub sync
                      </TooltipContent>
                    </Tooltip>
                  )}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {prompt.body.length > 72
                    ? `${prompt.body.slice(0, 72)}…`
                    : prompt.body}
                </span>
              </div>
              <Button
                variant='ghost'
                size='icon-sm'
                className='text-destructive/80 hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive shrink-0'
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDeleteId(prompt.id)
                }}
                aria-label='Delete prompt'
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
