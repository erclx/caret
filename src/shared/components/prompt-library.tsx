import { useState } from 'react'

import { usePrompts } from '@/shared/hooks/use-prompts'
import type { Prompt } from '@/shared/types'

import { PromptForm } from './prompt-form'
import { PromptList } from './prompt-list'

export function PromptLibrary() {
  const { prompts, isLoading, addPrompt, updatePrompt, deletePrompt } =
    usePrompts()
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)

  if (isLoading) {
    return (
      <div className='flex h-full items-center justify-center p-4'>
        <p className='text-muted-foreground text-sm'>Loading prompts...</p>
      </div>
    )
  }

  const handleCreate = () => {
    setEditingPrompt(null)
    setView('form')
  }

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setView('form')
  }

  const handleSave = async (data: { name: string; body: string }) => {
    if (editingPrompt) {
      await updatePrompt(editingPrompt.id, data)
    } else {
      await addPrompt(data)
    }
    setView('list')
  }

  const handleCancel = () => {
    setView('list')
  }

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {view === 'list' ? (
        <PromptList
          prompts={prompts}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={deletePrompt}
        />
      ) : (
        <div className='flex h-full flex-col overflow-y-auto pr-2'>
          <h2 className='text-foreground mb-4 text-sm font-semibold'>
            {editingPrompt ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <PromptForm
            initialPrompt={editingPrompt}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}
