import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useGithubSync } from '@/shared/hooks/use-github-sync'
import type { Settings } from '@/shared/types'
import { storage } from '@/shared/utils/storage'

const mockStorage = new Map<string, unknown>()
type StorageChangeListener = (
  changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
  areaName: string,
) => void
let listeners: StorageChangeListener[] = []

vi.stubGlobal('chrome', {
  storage: {
    local: {
      get: vi.fn(
        async (
          keys: string | string[] | Record<string, unknown> | null | undefined,
        ) => {
          if (keys === null || keys === undefined) {
            return Object.fromEntries(mockStorage.entries())
          }
          if (typeof keys === 'string') {
            return mockStorage.has(keys)
              ? { [keys]: mockStorage.get(keys) }
              : {}
          }
          if (Array.isArray(keys)) {
            const res: Record<string, unknown> = {}
            for (const k of keys) {
              if (mockStorage.has(k)) res[k] = mockStorage.get(k)
            }
            return res
          }
          if (typeof keys === 'object') {
            const res: Record<string, unknown> = {}
            for (const [k, v] of Object.entries(keys)) {
              res[k] = mockStorage.has(k) ? mockStorage.get(k) : v
            }
            return res
          }
          return {}
        },
      ),
      set: vi.fn(async (items: Record<string, unknown>) => {
        const changes: Record<
          string,
          { oldValue?: unknown; newValue?: unknown }
        > = {}
        for (const [k, v] of Object.entries(items)) {
          changes[k] = { oldValue: mockStorage.get(k), newValue: v }
          mockStorage.set(k, v)
        }
        listeners.forEach((l) => l(changes, 'local'))
      }),
      onChanged: {
        addListener: vi.fn((l: StorageChangeListener) => listeners.push(l)),
        removeListener: vi.fn((l: StorageChangeListener) => {
          listeners = listeners.filter((fn) => fn !== l)
        }),
      },
    },
  },
})

const BASE_CONFIG = {
  pat: 'ghp_test',
  owner: 'testuser',
  repo: 'snippets',
  branch: 'main',
  snippetsPath: 'snippets',
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return { sites: {}, ...overrides }
}

describe('useGithubSync', () => {
  beforeEach(() => {
    mockStorage.clear()
    listeners = []
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should skip reviewing and return upToDateCount when diff has no changes', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { result } = renderHook(() => useGithubSync())

    await waitFor(() => {
      expect(result.current.config).toBeDefined()
    })

    await act(async () => {
      await result.current.sync()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })

    expect(result.current.upToDateCount).toBe(0)
    expect(result.current.diff).toBeNull()

    const saved = mockStorage.get('settings') as ReturnType<typeof makeSettings>
    expect(saved?.github?.lastSyncedAt).toBeGreaterThan(0)
    expect(saved?.github?.lastSyncedCount).toBe(0)
  })

  it('should auto-cancel a review when the GitHub config changes', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'existing-prompt',
        body: 'hello',
        source: 'github',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { result } = renderHook(() => useGithubSync())

    await waitFor(() => {
      expect(result.current.config).toBeDefined()
    })

    await act(async () => {
      await result.current.sync()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('reviewing')
    })

    await act(async () => {
      await storage.setSettings(
        makeSettings({ github: { ...BASE_CONFIG, repo: 'changed-repo' } }),
      )
    })

    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })
  })

  it('should not cancel a review when an unrelated setting changes', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'existing-prompt',
        body: 'hello',
        source: 'github',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    const { result } = renderHook(() => useGithubSync())

    await waitFor(() => {
      expect(result.current.config).toBeDefined()
    })

    await act(async () => {
      await result.current.sync()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('reviewing')
    })

    await act(async () => {
      await storage.setSettings(
        makeSettings({
          github: BASE_CONFIG,
          sites: { 'claude.ai': { triggerSymbol: '/', enabled: true } },
        }),
      )
    })

    expect(result.current.status).toBe('reviewing')
  })
})
