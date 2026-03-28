import { useEffect, useRef } from 'react'

import type { Prompt } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

import { useDropdown } from './use-dropdown'

export interface DropdownProps {
  prompts: Prompt[]
  query: string
  onSelect: (prompt: Prompt) => void
  onClose: () => void
}

export function Dropdown({ prompts, query, onSelect, onClose }: DropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { filteredPrompts, selectedIndex, setSelectedIndex } = useDropdown({
    prompts,
    query,
    onSelect,
    onClose,
    dropdownRef: containerRef,
  })

  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) {
      const selectedEl = listRef.current.children[selectedIndex] as HTMLElement
      selectedEl?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div ref={containerRef} className='flex w-full flex-col'>
      {filteredPrompts.length === 0 ? (
        <p className='text-muted-foreground px-3 py-4 text-center text-[11px]'>
          No prompts yet - click the extension icon to add one
        </p>
      ) : (
        <div ref={listRef} className='max-h-70 overflow-y-auto'>
          {filteredPrompts.map((prompt, index) => (
            <div
              key={prompt.id}
              className={cn(
                'flex cursor-pointer items-center gap-2 px-3 py-3 select-none',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50',
              )}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => onSelect(prompt)}
            >
              <span className='text-foreground w-3 shrink-0 font-sans text-[11px]'>
                {index === selectedIndex ? '▶︎' : ''}
              </span>
              <div className='flex min-w-0 flex-col gap-0.5 overflow-hidden'>
                <span className='text-foreground truncate text-[13px] leading-tight font-medium'>
                  {prompt.label && (
                    <span className='text-muted-foreground'>
                      {prompt.label} ·{' '}
                    </span>
                  )}
                  {prompt.name}
                </span>
                <span className='text-muted-foreground truncate text-[12px] leading-tight'>
                  {prompt.body}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className='border-border text-muted-foreground shrink-0 border-t px-3 py-1.5 text-[11px] select-none'>
        ↑↓ navigate · Enter/Tab insert · Esc close
      </div>
    </div>
  )
}
