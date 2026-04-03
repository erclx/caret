import { ChevronDown, HelpCircle, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { GithubIcon } from '@/shared/components/github-icon'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
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
  const [isNameTouched, setIsNameTouched] = useState(false)
  const [labelError, setLabelError] = useState('')
  const [body, setBody] = useState(initialBody)
  const [bodyError, setBodyError] = useState('')
  const [isBodyTouched, setIsBodyTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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

  function validateName(val: string, currentLabel = label): string {
    if (!val) return ''
    if (!KEBAB_RE.test(val))
      return 'Use lowercase letters, numbers, and hyphens (e.g. my-prompt)'
    if (isDuplicatePair(val, currentLabel)) return DUPLICATE_MSG
    return ''
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setName(val)
    setLabelError('')
    setSaveError(null)
    if (isNameTouched) {
      setNameError(validateName(val))
    }
  }

  function handleNameBlur(e: React.FocusEvent<HTMLInputElement>) {
    setIsNameTouched(true)
    setNameError(validateName(e.target.value))
  }

  function handleLabelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setLabel(val)
    setHighlightedIndex(-1)
    setIsComboboxOpen(true)
    setSaveError(null)
    if (isNameTouched && nameError === DUPLICATE_MSG)
      setNameError(validateName(name, val))
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
    setSaveError(null)
    if (isNameTouched && nameError === DUPLICATE_MSG)
      setNameError(validateName(name, l))
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
    setSaveError(null)
    try {
      const trimmedLabel = label.trim()
      await onSave({
        name,
        body,
        ...(trimmedLabel ? { label: trimmedLabel } : {}),
      })
      setIsSaved(true)
      savedTimerRef.current = setTimeout(() => onCancel(), 1200)
    } catch {
      setSaveError('Could not save. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const discardRow = (
    <div className='bg-muted dark:border-border flex shrink-0 items-center justify-between gap-2 rounded-md p-3 dark:border'>
      <span className='text-foreground text-sm'>Discard changes?</span>
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
    <TooltipProvider>
      <form onSubmit={handleSubmit} className='flex h-full flex-col gap-4 px-2'>
        <button
          type='button'
          className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex w-fit shrink-0 items-center gap-1 rounded text-sm transition-colors outline-none focus-visible:ring-2'
          onClick={handleRequestDiscard}
        >
          ← Back
        </button>
        {initialPrompt?.source === 'github' && (
          <div className='bg-muted text-muted-foreground flex shrink-0 items-center gap-2 rounded-md p-3 text-sm'>
            <GithubIcon aria-hidden='true' className='size-4 shrink-0' />
            <span>
              Synced from GitHub. Local edits will be lost on next sync.
            </span>
          </div>
        )}
        <div className='flex shrink-0 flex-col gap-2'>
          <Label htmlFor='name'>Name</Label>
          <Input
            id='name'
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            required
            placeholder='e.g. summarize-text'
            className='text-sm'
          />
          {nameError && <p className='text-destructive text-xs'>{nameError}</p>}
        </div>
        <div className='flex shrink-0 flex-col gap-2'>
          <div className='flex items-center gap-1.5'>
            <Label htmlFor='label'>Label (optional)</Label>
            <Tooltip>
              <TooltipTrigger
                type='button'
                aria-label='Case sensitivity information'
                className='text-muted-foreground focus-visible:ring-ring/50 cursor-default p-0 outline-none focus-visible:rounded focus-visible:ring-2'
              >
                <HelpCircle className='size-3.5' />
              </TooltipTrigger>
              <TooltipContent side='top' className='max-w-64'>
                Labels are case-sensitive
              </TooltipContent>
            </Tooltip>
          </div>
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
              role='combobox'
              aria-expanded={isComboboxOpen && filteredLabels.length > 0}
              aria-haspopup='listbox'
              aria-autocomplete='list'
              aria-controls='label-listbox'
              aria-activedescendant={
                isComboboxOpen && highlightedIndex >= 0
                  ? `label-option-${highlightedIndex}`
                  : undefined
              }
              value={label}
              onChange={handleLabelChange}
              onFocus={() => setIsComboboxOpen(true)}
              onBlur={handleLabelBlur}
              onKeyDown={handleLabelKeyDown}
              placeholder='e.g. writing'
              className={cn('pr-7 text-sm', label && 'pr-14')}
              autoComplete='off'
            />
            <ChevronDown className='text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2' />
            {label && (
              <button
                type='button'
                className='text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-1/2 right-7 -translate-y-1/2 rounded transition-colors outline-none focus-visible:ring-2'
                onClick={() => {
                  setLabel('')
                  setLabelError('')
                  setIsComboboxOpen(false)
                  setHighlightedIndex(-1)
                  if (
                    name &&
                    KEBAB_RE.test(name) &&
                    isDuplicatePair(name, '')
                  ) {
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
              <div
                id='label-listbox'
                role='listbox'
                className='border-border bg-card dark:ring-border absolute top-full right-0 left-0 z-10 mt-1 max-h-40 overflow-y-auto rounded-md border shadow-md dark:ring-1'
              >
                {filteredLabels.map((l, i) => (
                  <div
                    key={l}
                    id={`label-option-${i}`}
                    role='option'
                    aria-selected={i === highlightedIndex}
                    tabIndex={-1}
                    className={cn(
                      'w-full cursor-default px-3 py-1.5 text-left text-sm transition-colors',
                      i === highlightedIndex
                        ? 'bg-accent text-foreground'
                        : 'text-foreground hover:bg-accent/50',
                    )}
                    onClick={() => selectLabel(l)}
                  >
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
          {labelError && (
            <p className='text-destructive text-xs'>{labelError}</p>
          )}
        </div>
        <div className='flex min-h-0 flex-1 flex-col gap-2'>
          <Label htmlFor='body'>Prompt body</Label>
          <Textarea
            id='body'
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              setSaveError(null)
              if (isBodyTouched) {
                setBodyError(
                  e.target.value.trim() ? '' : 'Enter the prompt content',
                )
              }
            }}
            onBlur={(e) => {
              setIsBodyTouched(true)
              setBodyError(
                e.target.value.trim() ? '' : 'Enter the prompt content',
              )
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
          <div className='flex shrink-0 flex-col gap-2'>
            {saveError && (
              <p className='text-destructive text-right text-xs'>{saveError}</p>
            )}
            <div className='flex justify-end gap-2'>
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
          </div>
        )}
      </form>
    </TooltipProvider>
  )
}
