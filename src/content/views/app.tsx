import { useCallback } from 'react'

import { usePrompts } from '@/shared/hooks/use-prompts'
import type { Prompt } from '@/shared/types'

import { useInputDetection } from '../hooks/use-input-detection'
import { Dropdown } from './dropdown/dropdown'

export function App() {
  const { isActive, rect, query, deactivate } = useInputDetection()
  const { prompts, isLoading } = usePrompts()

  const handleSelect = useCallback(
    (_prompt: Prompt) => {
      deactivate()
    },
    [deactivate],
  )

  if (!isActive || !rect || isLoading) return null

  return (
    <div
      className='border-border bg-background text-foreground fixed z-50 overflow-hidden rounded-lg border shadow-xl'
      style={{
        top: `${rect.top - 8}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        transform: 'translateY(-100%)',
      }}
    >
      <Dropdown
        prompts={prompts}
        query={query}
        onSelect={handleSelect}
        onClose={deactivate}
      />
    </div>
  )
}
