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
const DUPLICATE_MSG = 'A prompt with this name and label already exists'

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
  const [labelError, setLabelError] = useState('')
  const [body, setBody] = useState(initialBody)
  const [bodyError, setBodyError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (savedTimerRef.current !== null) clearTimeout(savedTimerRef.current)
    }
  }, [])

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
    setLabelError('')
    if (!val) {
      setNameError('')
      return
    }
    if (!KEBAB_RE.test(val)) {
      setNameError(
        'Use lowercase letters, numbers, and hyphens (e.g. my-prompt)',
      )
      return
    }
    if (isDuplicatePair(val, label)) {
      setNameError(DUPLICATE_MSG)
    } else {
      setNameError('')
    }
  }

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setLabel(val)
    setHighlightedIndex(-1)
    setIsComboboxOpen(true)
    if (nameError === DUPLICATE_MSG) setNameError('')
    if (name && KEBAB_RE.test(name) && isDuplicatePair(name, val)) {
      setLabelError(DUPLICATE_MSG)
    } else {
      setLabelError('')
    }
  }

  function handleLabelBlur() {
    const trimmed = label.trim()
    if (trimmed === label) return
    setLabel(trimmed)
    if (name && KEBAB_RE.test(name)) {
      if (isDuplicatePair(name, trimmed)) {
        setLabelError(DUPLICATE_MSG)
      } else {
        setLabelError('')
      }
    }
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
    if (nameError === DUPLICATE_MSG) setNameError('')
    if (name && KEBAB_RE.test(name) && isDuplicatePair(name, l)) {
      setLabelError(DUPLICATE_MSG)
    } else {
      setLabelError('')
    }
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
    if (isSaved) {
      onCancel()
      return
    }
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
      setIsSaved(true)
      savedTimerRef.current = setTimeout(() => onCancel(), 2000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const discardRow = (
    <div className='bg-muted dark:border-border flex shrink-0 items-center justify-between gap-2 rounded-md p-3 dark:border'>
      <span className='text-muted-foreground text-sm'>Discard changes?</span>
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
        <p className='text-muted-foreground text-xs'>
          Labels are case-sensitive.
        </p>
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
            onBlur={handleLabelBlur}
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
                setLabelError('')
                setIsComboboxOpen(false)
                setHighlightedIndex(-1)
                if (name && KEBAB_RE.test(name) && isDuplicatePair(name, '')) {
                  setNameError(DUPLICATE_MSG)
                } else if (nameError === DUPLICATE_MSG) {
                  setNameError('')
                }
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
        {labelError && <p className='text-destructive text-xs'>{labelError}</p>}
      </div>
      <div className='flex min-h-0 flex-1 flex-col gap-2'>
        <Label htmlFor='body'>Prompt body</Label>
        <Textarea
          id='body'
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            if (e.target.value.trim()) setBodyError('')
          }}
          onBlur={() => {
            if (!body.trim()) setBodyError('Enter the prompt content')
          }}
          required
          placeholder='Enter the prompt content...'
          className='flex-1 resize-none text-sm'
        />
        {bodyError && <p className='text-destructive text-xs'>{bodyError}</p>}
      </div>
      {isSaved ? (
        <p className='text-muted-foreground shrink-0 text-right text-sm'>
          Saved ✓
        </p>
      ) : showDiscard ? (
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
            disabled={
              isSubmitting ||
              !!nameError ||
              !!labelError ||
              !name ||
              !body.trim()
            }
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      )}
    </form>
  )
}
