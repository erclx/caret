import { useCallback, useEffect, useState } from 'react'

import type { Prompt } from '@/shared/types'
import { mergePrompts } from '@/shared/utils/io'
import { storage } from '@/shared/utils/storage'

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    storage.getPrompts().then((data) => {
      if (isMounted) {
        setPrompts(data)
        setIsLoading(false)
      }
    })

    const unsubscribe = storage.subscribe((changes) => {
      if (changes.prompts && isMounted) {
        setPrompts((changes.prompts.newValue as Prompt[]) || [])
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
    async (incoming: Prompt[]): Promise<{ added: number; updated: number }> => {
      const current = await storage.getPrompts()
      const { merged, added, updated } = mergePrompts(current, incoming)
      await storage.setPrompts(merged)
      return { added, updated }
    },
    [],
  )

  return {
    prompts,
    isLoading,
    addPrompt,
    updatePrompt,
    deletePrompt,
    importPrompts,
  }
}
