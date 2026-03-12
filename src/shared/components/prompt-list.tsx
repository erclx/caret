import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import type { Prompt } from '@/shared/types'

export interface PromptListProps {
  prompts: Prompt[]
  onCreate: () => void
  onEdit: (prompt: Prompt) => void
  onDelete: (id: string) => void
}

export function PromptList({
  prompts,
  onCreate,
  onEdit,
  onDelete,
}: PromptListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (prompts.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-8 text-center'>
        <p className='text-muted-foreground text-sm'>No prompts found.</p>
        <Button variant='outline' onClick={onCreate}>
          <Plus className='mr-2 size-4' /> Create Prompt
        </Button>
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col gap-4 overflow-hidden'>
      <div className='flex shrink-0 items-center justify-between'>
        <h2 className='text-foreground text-sm font-semibold'>Your prompts</h2>
        <Button
          variant='outline'
          size='sm'
          className='transition-colors dark:hover:bg-zinc-700 dark:hover:text-white'
          onClick={onCreate}
        >
          <Plus className='mr-1 size-4' /> New
        </Button>
      </div>

      <div className='-mx-4 flex-1 overflow-y-auto px-4 pb-4'>
        <div className='flex flex-col gap-2'>
          {prompts.map((prompt) => {
            if (confirmDeleteId === prompt.id) {
              return (
                <div
                  key={prompt.id}
                  className='border-destructive bg-destructive/10 flex items-center justify-between gap-2 rounded-md border p-3 shadow-sm'
                >
                  <span className='text-destructive text-sm font-medium'>
                    Delete prompt?
                  </span>
                  <div className='flex shrink-0 gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='text-foreground hover:bg-destructive/20'
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
                      Delete
                    </Button>
                  </div>
                </div>
              )
            }
            return (
              <div
                key={prompt.id}
                className='group border-border bg-card hover:border-foreground/30 hover:bg-accent/5 flex items-center justify-between gap-2 rounded-md border p-3 shadow-sm transition-colors'
              >
                <div className='flex flex-col overflow-hidden'>
                  <span className='text-foreground truncate text-sm font-medium'>
                    {prompt.name}
                  </span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {prompt.body}
                  </span>
                </div>
                <div className='flex shrink-0 gap-1'>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='size-8 dark:hover:bg-zinc-700'
                    onClick={() => onEdit(prompt)}
                    aria-label='Edit prompt'
                  >
                    <Edit2 className='size-4' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='text-destructive/80 hover:bg-destructive/10 dark:hover:bg-destructive/20 hover:text-destructive size-8'
                    onClick={() => setConfirmDeleteId(prompt.id)}
                    aria-label='Delete prompt'
                  >
                    <Trash2 className='size-4' />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
