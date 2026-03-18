import { useCallback, useEffect, useState } from 'react'

import type { Prompt } from '@/shared/types'
import { mergePrompts } from '@/shared/utils/io'
import { storage } from '@/shared/utils/storage'

export function sortPrompts(prompts: Prompt[]): Prompt[] {
  return [...prompts].sort((a, b) => {
    const aLocal = a.source !== 'github' ? 0 : 1
    const bLocal = b.source !== 'github' ? 0 : 1
    if (aLocal !== bLocal) return aLocal - bLocal
    return b.updatedAt - a.updatedAt
  })
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasEverHadPrompts, setHasEverHadPrompts] = useState(false)

  useEffect(() => {
    let isMounted = true

    Promise.all([storage.getPrompts(), storage.hasEverHadPrompts()]).then(
      ([data, everHad]) => {
        if (isMounted) {
          setPrompts(sortPrompts(data))
          setHasEverHadPrompts(everHad)
          setIsLoading(false)
        }
      },
    )

    const unsubscribe = storage.subscribe((changes) => {
      if (changes.prompts && isMounted) {
        setPrompts(sortPrompts((changes.prompts.newValue as Prompt[]) || []))
        setHasEverHadPrompts(true)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const addPrompt = useCallback(
    async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newPrompt: Prompt = {
        ...prompt,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const current = await storage.getPrompts()
      await storage.setPrompts([...current, newPrompt])
    },
    [],
  )

  const updatePrompt = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>>,
    ) => {
      const current = await storage.getPrompts()
      const updated = current.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p,
      )
      await storage.setPrompts(updated)
    },
    [],
  )

  const deletePrompt = useCallback(async (id: string) => {
    const current = await storage.getPrompts()
    await storage.setPrompts(current.filter((p) => p.id !== id))
  }, [])

  const importPrompts = useCallback(
    async (
      incoming: Prompt[],
    ): Promise<{ addedNames: string[]; updatedNames: string[] }> => {
      const current = await storage.getPrompts()
      const { merged, addedNames, updatedNames } = mergePrompts(
        current,
        incoming,
      )
      await storage.setPrompts(merged)
      return { addedNames, updatedNames }
    },
    [],
  )

  return {
    prompts,
    isLoading,
    hasEverHadPrompts,
    addPrompt,
    updatePrompt,
    deletePrompt,
    importPrompts,
  }
}
