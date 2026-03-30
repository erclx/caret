import { X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [showDiscard, setShowDiscard] = useState(false)
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const filteredLabels = useMemo(() => {
    if (!existingLabels.length) return []
    if (!label.trim()) return existingLabels
    const lower = label.toLowerCase()
    return existingLabels.filter((l) => l.toLowerCase().includes(lower))
  }, [existingLabels, label])

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

  function applyDuplicateCheck(n: string, l: string) {
    if (n && KEBAB_RE.test(n)) {
      if (isDuplicatePair(n, l)) {
        setNameError('A prompt with this name and label already exists')
      } else {
        setNameError('')
      }
    }
  }

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setLabel(val)
    setHighlightedIndex(-1)
    setIsComboboxOpen(true)
    applyDuplicateCheck(name, val)
  }

  function handleLabelKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsComboboxOpen(true)
      if (filteredLabels.length > 0) {
        setHighlightedIndex((i) =>
          i === filteredLabels.length - 1 ? 0 : i + 1,
        )
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIsComboboxOpen(true)
      if (filteredLabels.length > 0) {
        setHighlightedIndex((i) => (i <= 0 ? filteredLabels.length - 1 : i - 1))
      }
    } else if (e.key === 'Enter' && isComboboxOpen && highlightedIndex >= 0) {
      e.preventDefault()
      selectLabel(filteredLabels[highlightedIndex])
    } else if (e.key === 'Tab' && isComboboxOpen) {
      setIsComboboxOpen(false)
      setHighlightedIndex(-1)
    } else if (e.key === 'Escape' && isComboboxOpen) {
      e.nativeEvent.stopPropagation()
      setIsComboboxOpen(false)
      setHighlightedIndex(-1)
    }
  }

  function selectLabel(l: string) {
    setLabel(l)
    setIsComboboxOpen(false)
    setHighlightedIndex(-1)
    applyDuplicateCheck(name, l)
  }

  const labelInputRef = useRef<HTMLInputElement>(null)

  const onEscRef = useRef<() => void>(() => {})
  onEscRef.current = () => {
    if (showDiscard) {
      setShowDiscard(false)
    } else {
      handleRequestDiscard()
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

  function handleRequestDiscard() {
    if (isDirty) {
      setShowDiscard(true)
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
          variant='outline'
          size='sm'
          className='hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:hover:text-white'
          onClick={() => setShowDiscard(false)}
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
      <button
        type='button'
        className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex w-fit shrink-0 items-center gap-1 rounded text-sm transition-colors outline-none focus-visible:ring-2'
        onClick={handleRequestDiscard}
      >
        ← Back
      </button>
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
        <Label htmlFor='label'>Label (optional)</Label>
        <div
          className='relative'
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setIsComboboxOpen(false)
              setHighlightedIndex(-1)
            }
          }}
        >
          <Input
            ref={labelInputRef}
            id='label'
            value={label}
            onChange={handleLabelChange}
            onFocus={() => setIsComboboxOpen(true)}
            onKeyDown={handleLabelKeyDown}
            placeholder='e.g. writing'
            className={cn('text-sm', label && 'pr-8')}
            autoComplete='off'
          />
          {label && (
            <button
              type='button'
              className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-2 -translate-y-1/2 rounded transition-colors outline-none focus-visible:ring-2'
              onClick={() => {
                setLabel('')
                setIsComboboxOpen(false)
                setHighlightedIndex(-1)
                applyDuplicateCheck(name, '')
                labelInputRef.current?.focus()
              }}
              aria-label='Clear label'
            >
              <X className='size-3.5' />
            </button>
          )}
          {isComboboxOpen && filteredLabels.length > 0 && (
            <div className='border-border bg-card absolute top-full right-0 left-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-md border shadow-md'>
              {filteredLabels.map((l, i) => (
                <button
                  key={l}
                  type='button'
                  tabIndex={-1}
                  className={cn(
                    'w-full px-3 py-1.5 text-left text-sm transition-colors outline-none',
                    i === highlightedIndex
                      ? 'bg-accent text-foreground'
                      : 'text-foreground hover:bg-accent/50',
                  )}
                  onClick={() => selectLabel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
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
      {showDiscard ? (
        discardRow
      ) : (
        <div className='flex shrink-0 justify-end gap-2'>
          <Button
            type='button'
            variant='ghost'
            className='text-muted-foreground'
            onClick={handleRequestDiscard}
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
