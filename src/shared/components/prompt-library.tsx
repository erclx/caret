import { ChevronDown, Plus, Settings, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { Input } from '@/shared/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover'
import { useGithubSync } from '@/shared/hooks/use-github-sync'
import { usePrompts } from '@/shared/hooks/use-prompts'
import type { Prompt } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

import { GitHubView } from './github-view'
import { Logo } from './logo'
import { PromptForm } from './prompt-form'
import { PromptList } from './prompt-list'

type Tab = 'prompts' | 'github'
type View = 'list' | 'form'

const UNLABELED = '__unlabeled__'

export function PromptLibrary() {
  const {
    prompts,
    isLoading,
    hasEverHadPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
  } = usePrompts()
  const githubSync = useGithubSync()
  const [view, setView] = useState<View>('list')
  const [tab, setTab] = useState<Tab>('prompts')
  const [query, setQuery] = useState('')
  const [activeLabels, setActiveLabels] = useState<Set<string>>(new Set())
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  const allLabels = useMemo(() => {
    const labels = new Set<string>()
    for (const p of prompts) {
      if (p.label) labels.add(p.label)
    }
    return [...labels].sort()
  }, [prompts])

  const hasUnlabeled = useMemo(() => prompts.some((p) => !p.label), [prompts])

  const filteredPrompts = useMemo(() => {
    let result = prompts
    const trimmed = query.trim().toLowerCase()
    if (trimmed)
      result = result.filter((p) => p.name.toLowerCase().includes(trimmed))
    if (activeLabels.size > 0) {
      result = result.filter((p) => {
        const key = p.label ?? UNLABELED
        return activeLabels.has(key)
      })
    }
    return result
  }, [prompts, query, activeLabels])

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center p-4'>
        <p className='text-muted-foreground text-sm'>Loading prompts...</p>
      </div>
    )
  }

  function handleCreate() {
    setEditingPrompt(null)
    setView('form')
  }

  function handleEdit(prompt: Prompt) {
    setEditingPrompt(prompt)
    setView('form')
  }

  async function handleSave(data: {
    name: string
    label?: string
    body: string
  }) {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, data)
    } else {
      await addPrompt(data)
    }
    setView('list')
  }

  function handleBack() {
    setView('list')
  }

  function handleToggleLabel(key: string) {
    setActiveLabels((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const existingPrompts = prompts.map((p) => ({ label: p.label, name: p.name }))
  const hasActiveFilter = query.trim().length > 0 || activeLabels.size > 0
  const hasLabels = allLabels.length > 0

  if (view === 'form') {
    return (
      <div className='flex h-full flex-col overflow-hidden pt-1 pr-2 pb-1'>
        <PromptForm
          initialPrompt={editingPrompt}
          existingPrompts={existingPrompts}
          existingLabels={allLabels}
          onSave={handleSave}
          onCancel={handleBack}
        />
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col gap-3 overflow-hidden px-1 pt-1 pb-1'>
      <h1 className='sr-only'>Caret</h1>
      <div className='flex shrink-0 items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Logo className='size-4' />
          <span className='text-foreground translate-y-px text-sm font-semibold'>
            Caret
          </span>
        </div>
        <Button
          variant='ghost'
          size='icon-sm'
          onClick={() => chrome.runtime.openOptionsPage()}
          aria-label='Open settings'
        >
          <Settings className='size-4' />
        </Button>
      </div>

      <div className='flex shrink-0 items-center gap-2'>
        <div className='flex flex-1 gap-1'>
          {(['prompts', 'github'] as const).map((t) => (
            <button
              key={t}
              className={cn(
                'focus-visible:ring-ring/50 rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors outline-none focus-visible:ring-2',
                tab === t
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setTab(t)}
            >
              {t === 'prompts' ? 'Prompts' : 'GitHub'}
            </button>
          ))}
        </div>
        {tab === 'prompts' && (
          <Button
            variant='outline'
            size='sm'
            className='dark:hover:bg-zinc-700 dark:hover:text-white'
            onClick={handleCreate}
          >
            <Plus className='size-4' /> New
          </Button>
        )}
      </div>

      {tab === 'prompts' && (
        <>
          <div className='flex shrink-0 items-center gap-2'>
            <div className='relative flex-1'>
              <Input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search prompts...'
                className='text-sm'
              />
              {query && (
                <button
                  className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-2 -translate-y-1/2 rounded transition-colors outline-none focus-visible:ring-2'
                  onClick={() => {
                    setQuery('')
                    searchRef.current?.focus()
                  }}
                  aria-label='Clear search'
                >
                  <X className='size-3.5' />
                </button>
              )}
            </div>
            {hasLabels && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className={cn(
                      'h-9 shrink-0 gap-1 text-xs',
                      activeLabels.size === 0 && 'text-muted-foreground',
                    )}
                  >
                    Label
                    {activeLabels.size > 0 && (
                      <span className='text-foreground'>
                        · {activeLabels.size}
                      </span>
                    )}
                    <ChevronDown className='size-3' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-44 p-2'>
                  <div className='border-border mb-1 flex justify-end border-b pb-1'>
                    <button
                      className={cn(
                        'text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 rounded text-xs transition-colors outline-none focus-visible:ring-2',
                        activeLabels.size === 0 && 'invisible',
                      )}
                      tabIndex={activeLabels.size === 0 ? -1 : 0}
                      aria-hidden={activeLabels.size === 0}
                      onClick={() => setActiveLabels(new Set())}
                    >
                      Clear
                    </button>
                  </div>
                  <div className='flex max-h-48 flex-col gap-0.5 overflow-y-auto'>
                    {allLabels.map((l) => (
                      <div
                        key={l}
                        className='hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm'
                        onClick={() => handleToggleLabel(l)}
                      >
                        <Checkbox
                          checked={activeLabels.has(l)}
                          aria-label={l}
                          onCheckedChange={() => handleToggleLabel(l)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className='flex-1'>{l}</span>
                      </div>
                    ))}
                    {hasUnlabeled && (
                      <div
                        className='hover:bg-accent/50 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm'
                        onClick={() => handleToggleLabel(UNLABELED)}
                      >
                        <Checkbox
                          checked={activeLabels.has(UNLABELED)}
                          aria-label='Unlabeled'
                          onCheckedChange={() => handleToggleLabel(UNLABELED)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className='flex-1'>Unlabeled</span>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          <PromptList
            prompts={filteredPrompts}
            hasActiveFilter={hasActiveFilter}
            hasEverHadPrompts={hasEverHadPrompts}
            onEdit={handleEdit}
            onDelete={deletePrompt}
          />
        </>
      )}

      {tab === 'github' && <GitHubView {...githubSync} />}
    </div>
  )
}
