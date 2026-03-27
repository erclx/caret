import { Plus, Settings, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
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
  const showPills = allLabels.length > 0

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
    <div className='flex h-full flex-col gap-3 overflow-hidden px-1 pt-1'>
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
          <div className='relative shrink-0'>
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
          {showPills && (
            <div className='flex shrink-0 flex-wrap gap-1.5'>
              <button
                className={cn(
                  'focus-visible:ring-ring/50 rounded px-2 py-0.5 text-xs transition-colors outline-none focus-visible:ring-2',
                  activeLabels.size === 0
                    ? 'bg-accent text-foreground'
                    : 'border-border text-muted-foreground border bg-transparent',
                )}
                onClick={() => setActiveLabels(new Set())}
              >
                All
              </button>
              {allLabels.map((l) => (
                <button
                  key={l}
                  className={cn(
                    'focus-visible:ring-ring/50 flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors outline-none focus-visible:ring-2',
                    activeLabels.has(l)
                      ? 'bg-accent text-foreground'
                      : 'border-border text-muted-foreground border bg-transparent',
                  )}
                  onClick={() => handleToggleLabel(l)}
                >
                  {l}
                  {activeLabels.has(l) && (
                    <X className='size-2.5' aria-hidden />
                  )}
                </button>
              ))}
              {hasUnlabeled && (
                <button
                  className={cn(
                    'focus-visible:ring-ring/50 flex items-center gap-1 rounded px-2 py-0.5 text-xs transition-colors outline-none focus-visible:ring-2',
                    activeLabels.has(UNLABELED)
                      ? 'bg-accent text-foreground'
                      : 'border-border text-muted-foreground border bg-transparent',
                  )}
                  onClick={() => handleToggleLabel(UNLABELED)}
                >
                  Unlabeled
                  {activeLabels.has(UNLABELED) && (
                    <X className='size-2.5' aria-hidden />
                  )}
                </button>
              )}
            </div>
          )}
          <PromptList
            prompts={filteredPrompts}
            hasQuery={hasActiveFilter}
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
