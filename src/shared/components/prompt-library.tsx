import { Plus, Settings, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useGithubSync } from '@/shared/hooks/use-github-sync'
import { usePrompts } from '@/shared/hooks/use-prompts'
import type { Prompt } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

import { GitHubView } from './github-view'
import { PromptForm } from './prompt-form'
import { PromptList } from './prompt-list'

type Tab = 'prompts' | 'github'
type View = 'list' | 'form'

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
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  const filteredPrompts = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return prompts
    return prompts.filter((p) => p.name.toLowerCase().includes(trimmed))
  }, [prompts, query])

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

  async function handleSave(data: { name: string; body: string }) {
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

  const existingNames = prompts.map((p) => p.name)

  if (view === 'form') {
    return (
      <div className='flex h-full flex-col overflow-hidden pr-2'>
        <PromptForm
          initialPrompt={editingPrompt}
          existingNames={existingNames}
          onSave={handleSave}
          onCancel={handleBack}
        />
      </div>
    )
  }

  return (
    <div className='flex h-full flex-col gap-3 overflow-hidden px-1 pt-1'>
      <div className='flex shrink-0 items-center justify-between'>
        <div className='flex items-center gap-2'>
          <img src='/logo.png' alt='' className='size-5' aria-hidden='true' />
          <span className='text-foreground text-sm font-semibold'>Caret</span>
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
                'rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors',
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
                className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transition-colors'
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
          <PromptList
            prompts={filteredPrompts}
            hasQuery={query.trim().length > 0}
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
