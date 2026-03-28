import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { Prompt } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

export interface PromptFormProps {
  initialPrompt?: Prompt | null
  existingPrompts?: { label?: string; name: string }[]
  existingLabels?: string[]
  onSave: (data: {
    name: string
    label?: string
    body: string
  }) => Promise<void>
  onCancel: () => void
}

const KEBAB_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function PromptForm({
  initialPrompt,
  existingPrompts = [],
  existingLabels = [],
  onSave,
  onCancel,
}: PromptFormProps) {
  const initialName = initialPrompt?.name ?? ''
  const initialLabel = initialPrompt?.label ?? ''
  const initialBody = initialPrompt?.body ?? ''

  const [name, setName] = useState(initialName)
  const [label, setLabel] = useState(initialLabel)
  const [nameError, setNameError] = useState('')
  const [body, setBody] = useState(initialBody)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [discardTrigger, setDiscardTrigger] = useState<
    'back' | 'cancel' | null
  >(null)

  const isDirty =
    name !== initialName ||
    body !== initialBody ||
    (label || '') !== (initialLabel || '')

  function isDuplicatePair(n: string, l: string): boolean {
    const isEditingSelf =
      n === initialName && (l || '') === (initialLabel || '')
    if (isEditingSelf) return false
    return existingPrompts.some(
      (p) => p.name === n && (p.label ?? '') === (l || ''),
    )
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    if (val && !KEBAB_RE.test(val)) {
      setNameError(
        'Use lowercase letters, numbers, and hyphens (e.g. my-prompt)',
      )
    } else if (val && isDuplicatePair(val, label)) {
      setNameError('A prompt with this name and label already exists')
    } else {
      setNameError('')
    }
  }

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setLabel(val)
    if (name && KEBAB_RE.test(name)) {
      if (isDuplicatePair(name, val)) {
        setNameError('A prompt with this name and label already exists')
      } else {
        setNameError('')
      }
    }
  }

  const onEscRef = useRef<() => void>(() => {})
  onEscRef.current = () => {
    if (discardTrigger !== null) {
      setDiscardTrigger(null)
    } else {
      handleRequestDiscard('cancel')
    }
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return
      e.preventDefault()
      onEscRef.current()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleRequestDiscard(trigger: 'back' | 'cancel') {
    if (isDirty) {
      setDiscardTrigger(trigger)
    } else {
      onCancel()
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const trimmedLabel = label.trim()
      await onSave({
        name,
        body,
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const discardRow = (
    <div className='border-destructive bg-destructive/10 flex shrink-0 items-center justify-between gap-2 rounded-md border p-3 shadow-sm'>
      <span className='text-destructive text-sm font-medium'>
        Discard changes?
      </span>
      <div className='flex shrink-0 gap-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={() => setDiscardTrigger(null)}
        >
          Keep editing
        </Button>
        <Button
          type='button'
          variant='destructive'
          size='sm'
          onClick={onCancel}
        >
          Discard
        </Button>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className='flex h-full flex-col gap-4 px-2'>
      {discardTrigger === 'back' ? (
        discardRow
      ) : (
        <button
          type='button'
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex w-fit shrink-0 items-center gap-1 rounded text-sm transition-colors outline-none focus-visible:ring-2'
          onClick={() => handleRequestDiscard('back')}
        >
          ← Back
        </button>
      )}
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
      <div className='flex shrink-0 flex-col gap-2'>
        <Label htmlFor='label'>Label</Label>
        <Input
          id='label'
          value={label}
          onChange={handleLabelChange}
          placeholder='e.g. writing'
          className='text-sm'
        />
        {existingLabels.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {existingLabels.map((l) => (
              <button
                key={l}
                type='button'
                className={cn(
                  'border-border text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex items-center gap-1 rounded border px-2 py-0.5 text-xs transition-colors outline-none focus-visible:ring-2',
                  label === l && 'bg-accent text-foreground',
                )}
                onClick={() => {
                  const next = label === l ? '' : l
                  setLabel(next)
                  if (name && KEBAB_RE.test(name)) {
                    if (isDuplicatePair(name, next)) {
                      setNameError(
                        'A prompt with this name and label already exists',
                      )
                    } else {
                      setNameError('')
                    }
                  }
                }}
              >
                {l}
                {label === l && <X className='size-2.5' aria-hidden />}
              </button>
            ))}
          </div>
        )}
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
      {discardTrigger === 'cancel' ? (
        discardRow
      ) : (
        <div className='flex shrink-0 justify-end gap-2'>
          <Button
            type='button'
            variant='ghost'
            className='text-muted-foreground'
            onClick={() => handleRequestDiscard('cancel')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant='outline'
            type='submit'
            className='dark:hover:bg-zinc-700 dark:hover:text-white'
            disabled={isSubmitting || !!nameError || !name}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </form>
  )
}
