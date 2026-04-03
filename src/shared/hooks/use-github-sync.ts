import { useCallback, useState } from 'react'

import { usePrompts } from '@/shared/hooks/use-prompts'
import { useSettings } from '@/shared/hooks/use-settings'
import type { DiffResult, Snippet } from '@/shared/utils/github'
import { computeDiff, fetchSnippets } from '@/shared/utils/github'
import { storage } from '@/shared/utils/storage'

type SyncStatus = 'idle' | 'fetching' | 'reviewing' | 'applying'

function compositeKey(label: string | undefined, name: string): string {
  return `${label ?? ''}\x00${name}`
}

export function useGithubSync() {
  const { settings, updateSettings } = useSettings()
  const { prompts } = usePrompts()
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [syncConfigKey, setSyncConfigKey] = useState<string | null>(null)
  const [diff, setDiff] = useState<DiffResult | null>(null)
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [error, setError] = useState<string | null>(null)
  const [upToDateCount, setUpToDateCount] = useState<number | null>(null)

  const config = settings.github

  const configKey = config
    ? `${config.owner}/${config.repo}/${config.branch}/${config.snippetsPath}`
    : null

  const isStaleReview = status === 'reviewing' && syncConfigKey !== configKey
  const effectiveStatus: SyncStatus = isStaleReview ? 'idle' : status

  const sync = useCallback(async (): Promise<'up-to-date' | undefined> => {
    if (!config) return
    const isStale = status === 'reviewing' && syncConfigKey !== configKey
    if (status !== 'idle' && !isStale) return
    if (isStale) {
      setDiff(null)
      setSnippets([])
    }
    setSyncConfigKey(configKey)
    setStatus('fetching')
    setError(null)

    const result = await fetchSnippets(config)

    if (!result.ok) {
      setError(result.error)
      setUpToDateCount(null)
      setStatus('idle')
      return
    }

    const localKeys = new Map(
      prompts
        .filter((p) => p.source !== 'github')
        .map((p) => [compositeKey(p.label, p.name), p.body]),
    )
    const diffResult = computeDiff(
      prompts.filter((p) => p.source === 'github'),
      result.snippets,
      localKeys,
    )
    const hasChanges =
      diffResult.added.length +
        diffResult.updated.length +
        diffResult.removed.length +
        diffResult.skipped.length >
      0

    if (!hasChanges) {
      const now = Date.now()
      const current = await storage.getSettings()
      if (!current.github) {
        setStatus('idle')
        return
      }
      await updateSettings({
        ...current,
        github: {
          ...current.github,
          lastSyncedAt: now,
          lastSyncedCount: result.snippets.length,
        },
      })
      setUpToDateCount(result.snippets.length)
      setSyncConfigKey(null)
      setStatus('idle')
      return 'up-to-date'
    }

    setSnippets(result.snippets)
    setDiff(diffResult)
    setStatus('reviewing')
  }, [config, configKey, syncConfigKey, prompts, updateSettings, status])

  const applySync = useCallback(async () => {
    if (!config || !diff || isStaleReview) return
    setStatus('applying')

    const now = Date.now()
    const removedSet = new Set(
      diff.removed.map((e) => compositeKey(e.label, e.name)),
    )
    const updatedSet = new Set(
      diff.updated.map((e) => compositeKey(e.label, e.name)),
    )
    const snippetsByKey = new Map(
      snippets.map((s) => [compositeKey(s.label, s.name), s]),
    )

    const localPrompts = prompts.filter((p) => p.source !== 'github')

    const keptGithubPrompts = prompts
      .filter(
        (p) =>
          p.source === 'github' &&
          !removedSet.has(compositeKey(p.label, p.name)),
      )
      .map((p) => {
        if (updatedSet.has(compositeKey(p.label, p.name))) {
          const incoming = snippetsByKey.get(compositeKey(p.label, p.name))
          return incoming
            ? {
                ...p,
                body: incoming.body,
                label: incoming.label,
                updatedAt: now,
              }
            : p
        }
        return p
      })

    const addedPrompts = diff.added.flatMap((entry) => {
      const snippet = snippetsByKey.get(compositeKey(entry.label, entry.name))
      if (!snippet) return []
      return [
        {
          id: crypto.randomUUID(),
          name: snippet.name,
          ...(snippet.label ? { label: snippet.label } : {}),
          body: snippet.body,
          source: 'github' as const,
          createdAt: now,
          updatedAt: now,
        },
      ]
    })

    try {
      await storage.setPrompts([
        ...localPrompts,
        ...keptGithubPrompts,
        ...addedPrompts,
      ])

      const current = await storage.getSettings()
      if (current.github) {
        await updateSettings({
          ...current,
          github: {
            ...current.github,
            lastSyncedAt: now,
            lastSyncedCount: snippets.length,
          },
        })
      }

      setUpToDateCount(null)
      setDiff(null)
      setSnippets([])
      setSyncConfigKey(null)
    } catch {
      setError('Failed to apply changes')
    } finally {
      setStatus('idle')
    }
  }, [config, diff, isStaleReview, prompts, snippets, updateSettings])

  const cancelSync = useCallback(() => {
    setUpToDateCount(null)
    setDiff(null)
    setSnippets([])
    setSyncConfigKey(null)
    setStatus('idle')
  }, [])

  return {
    status: effectiveStatus,
    diff,
    error,
    config,
    upToDateCount,
    sync,
    applySync,
    cancelSync,
  }
}
