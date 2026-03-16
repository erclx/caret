import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { Prompt } from '@/shared/types'

export interface PromptFormProps {
  initialPrompt?: Prompt | null
  onSave: (data: { name: string; body: string }) => Promise<void>
  onCancel: () => void
}

const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function PromptForm({
  initialPrompt,
  onSave,
  onCancel,
}: PromptFormProps) {
  const [name, setName] = useState(initialPrompt?.name ?? '')
  const [nameError, setNameError] = useState('')
  const [body, setBody] = useState(initialPrompt?.body ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    if (val && !KEBAB_RE.test(val)) {
      setNameError(
        'Use lowercase letters, numbers, and hyphens (e.g. my-prompt)',
      )
    } else {
      setNameError('')
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave({ name, body })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex h-full flex-col gap-4 px-2'>
      <div className='flex shrink-0 flex-col gap-2'>
        <Label htmlFor='name'>Name</Label>
        <Input
          id='name'
          value={name}
          onChange={handleNameChange}
          required
          placeholder='e.g. summarize-text'
          className='text-sm'
        />
        {nameError && <p className='text-destructive text-xs'>{nameError}</p>}
      </div>
      <div className='flex min-h-0 flex-1 flex-col gap-2'>
        <Label htmlFor='body'>Prompt body</Label>
        <Textarea
          id='body'
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          placeholder='Enter the prompt content...'
          className='flex-1 resize-none text-sm'
        />
      </div>
      <div className='flex shrink-0 justify-end gap-2'>
        <Button
          type='button'
          variant='ghost'
          className='text-muted-foreground'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant='outline'
          type='submit'
          className='dark:hover:bg-zinc-700 dark:hover:text-white'
          disabled={isSubmitting || !!nameError}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
