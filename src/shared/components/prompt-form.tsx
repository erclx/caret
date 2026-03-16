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

export function PromptForm({
  initialPrompt,
  onSave,
  onCancel,
}: PromptFormProps) {
  const [name, setName] = useState(initialPrompt?.name ?? '')
  const [body, setBody] = useState(initialPrompt?.body ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          onChange={(e) => setName(e.target.value)}
          required
          pattern='^[a-zA-Z0-9_-]+$'
          title='Only letters, numbers, hyphens, and underscores'
          placeholder='e.g. summarize-text'
          className='text-sm'
        />
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
