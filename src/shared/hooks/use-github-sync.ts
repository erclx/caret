import { useCallback, useState } from 'react'

import { usePrompts } from '@/shared/hooks/use-prompts'
import { useSettings } from '@/shared/hooks/use-settings'
import type { DiffResult, Snippet } from '@/shared/utils/github'
import { computeDiff, fetchSnippets } from '@/shared/utils/github'
import { storage } from '@/shared/utils/storage'

type SyncStatus = 'idle' | 'fetching' | 'reviewing' | 'applying'

export function useGithubSync() {
  const { settings, updateSettings } = useSettings()
  const { prompts } = usePrompts()
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [error, setError] = useState<string | null>(null)

  const config = settings.github

  const sync = useCallback(async () => {
    if (!config) return
    setStatus('fetching')
    setError(null)

    const result = await fetchSnippets(config)

    if (!result.ok) {
      setError(result.error)
      setStatus('idle')
      return
    }

    setSnippets(result.snippets)
    setDiff(computeDiff(prompts, result.snippets))
    setStatus('reviewing')
  }, [config, prompts])

  const applySync = useCallback(async () => {
    if (!config || !diff) return
    setStatus('applying')

    const now = Date.now()
    const newPrompts = snippets.map((s) => ({
      id: crypto.randomUUID(),
      name: s.name,
      body: s.body,
      createdAt: now,
      updatedAt: now,
    }))

    await storage.setPrompts(newPrompts)

    const current = await storage.getSettings()
    await updateSettings({
      ...current,
      github: {
        ...config,
        lastSyncedAt: now,
        lastSyncedCount: snippets.length,
      },
    })

    setDiff(null)
    setSnippets([])
    setStatus('idle')
  }, [config, diff, snippets, updateSettings])

  const cancelSync = useCallback(() => {
    setDiff(null)
    setSnippets([])
    setStatus('idle')
  }, [])

  return { status, diff, error, config, sync, applySync, cancelSync }
}
