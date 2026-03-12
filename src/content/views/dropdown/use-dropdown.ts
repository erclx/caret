import { useEffect, useMemo, useState } from 'react'

import type { Prompt } from '@/shared/types'
import { fuzzyMatch } from '@/shared/utils/fuzzy'

export interface UseDropdownProps {
  prompts: Prompt[]
  query: string
  onSelect: (prompt: Prompt) => void
  onClose: () => void
}

export function useDropdown({
  prompts,
  query,
  onSelect,
  onClose,
}: UseDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [prevQuery, setPrevQuery] = useState(query)

  if (query !== prevQuery) {
    setSelectedIndex(0)
    setPrevQuery(query)
  }

  const filteredPrompts = useMemo(() => {
    if (!query) return prompts
    return prompts.filter(
      (p) => fuzzyMatch(query, p.name) || fuzzyMatch(query, p.body),
    )
  }, [prompts, query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDown = e.key === 'ArrowDown' || (e.ctrlKey && e.key === 'j')
      const isUp = e.key === 'ArrowUp' || (e.ctrlKey && e.key === 'p')
      const isEnter = e.key === 'Enter' || e.key === 'Tab'
      const isEscape = e.key === 'Escape'

      if (!isDown && !isUp && !isEnter && !isEscape) return

      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      if (isDown) {
        setSelectedIndex((prev) =>
          prev < filteredPrompts.length - 1 ? prev + 1 : 0,
        )
      } else if (isUp) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPrompts.length - 1,
        )
      } else if (isEnter) {
        if (filteredPrompts[selectedIndex]) {
          onSelect(filteredPrompts[selectedIndex])
        }
      } else if (isEscape) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [filteredPrompts, selectedIndex, onSelect, onClose])

  return { filteredPrompts, selectedIndex, setSelectedIndex }
}
