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

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave({ name, body })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4 px-2'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='name'>Trigger Name</Label>
        <Input
          id='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          pattern='^[a-zA-Z0-9_-]+$'
          title='Only letters, numbers, hyphens, and underscores'
          placeholder='e.g. summarize-text'
        />
      </div>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='body'>Prompt Body</Label>
        <Textarea
          id='body'
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          placeholder='Enter the prompt content...'
        />
      </div>
      <div className='mt-2 flex justify-end gap-2'>
        <Button
          type='button'
          variant='ghost'
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  )
}
