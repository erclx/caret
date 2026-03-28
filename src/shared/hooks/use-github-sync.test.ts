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

  it('should set error and return to idle when fetchSnippets fails', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
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

    expect(result.current.error).toBe(
      'Check that your token has repo read access.',
    )
    expect(result.current.diff).toBeNull()
  })

  it('should enter reviewing state with diff when changes exist', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'old-prompt',
        body: 'old body',
        source: 'github',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'new-prompt.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/new-prompt.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'New body.',
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

    expect(result.current.diff).not.toBeNull()
    expect(result.current.diff?.added).toEqual([
      { name: 'new-prompt', label: undefined },
    ])
    expect(result.current.diff?.removed).toEqual([
      { name: 'old-prompt', label: undefined },
    ])
  })

  it('should apply sync: write merged prompts and return to idle', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'existing',
        body: 'old',
        source: 'github',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'existing.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/existing.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'updated body',
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
      await result.current.applySync()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })

    expect(result.current.diff).toBeNull()

    const savedPrompts = mockStorage.get('prompts') as {
      name: string
      body: string
    }[]
    expect(savedPrompts).toHaveLength(1)
    expect(savedPrompts[0].name).toBe('existing')
    expect(savedPrompts[0].body).toBe('updated body')

    const savedSettings = mockStorage.get('settings') as ReturnType<
      typeof makeSettings
    >
    expect(savedSettings?.github?.lastSyncedAt).toBeGreaterThan(0)
  })

  it('should enter reviewing state with skipped diff when local prompt has same key but different body', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'chat-mode',
        body: 'local body',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'chat-mode.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/chat-mode.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'github body',
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

    expect(result.current.diff?.skipped).toEqual([
      { name: 'chat-mode', label: undefined },
    ])
    expect(result.current.upToDateCount).toBeNull()
  })

  it('should skip reviewing and return upToDateCount when local prompt body matches incoming snippet', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'chat-mode',
        body: 'shared body',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'chat-mode.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/chat-mode.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'shared body',
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

    expect(result.current.upToDateCount).toBe(1)
    expect(result.current.diff).toBeNull()
  })

  it('should not add a github prompt when a local prompt with the same name exists', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'chat-mode',
        body: 'local body',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'chat-mode.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/chat-mode.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'github body',
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

    expect(result.current.diff?.skipped).toEqual([
      { name: 'chat-mode', label: undefined },
    ])
    expect(result.current.diff?.added).toHaveLength(0)

    await act(async () => {
      await result.current.applySync()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })

    const savedPrompts = mockStorage.get('prompts') as {
      name: string
      body: string
      source?: string
    }[]
    expect(savedPrompts).toHaveLength(1)
    expect(savedPrompts[0].name).toBe('chat-mode')
    expect(savedPrompts[0].body).toBe('local body')
    expect(savedPrompts[0].source).toBeUndefined()
  })

  it('should cancel sync: clear diff and return to idle', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [
      {
        id: 'p1',
        name: 'existing',
        body: 'body',
        source: 'github',
        createdAt: 1,
        updatedAt: 1,
      },
    ])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'new.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/new.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'new body',
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

    act(() => {
      result.current.cancelSync()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.diff).toBeNull()
  })

  it('should apply label from subdirectory snippet to the saved prompt', async () => {
    mockStorage.set('settings', makeSettings({ github: BASE_CONFIG }))
    mockStorage.set('prompts', [])

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ name: 'claude', type: 'dir', download_url: null }],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            name: 'summarize.md',
            type: 'file',
            download_url:
              'https://raw.githubusercontent.com/testuser/snippets/main/snippets/claude/summarize.md',
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Summarize this.',
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

    expect(result.current.diff?.added).toEqual([
      { name: 'summarize', label: 'claude' },
    ])

    await act(async () => {
      await result.current.applySync()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('idle')
    })

    const savedPrompts = mockStorage.get('prompts') as {
      name: string
      label?: string
      source: string
    }[]
    expect(savedPrompts).toHaveLength(1)
    expect(savedPrompts[0].name).toBe('summarize')
    expect(savedPrompts[0].label).toBe('claude')
    expect(savedPrompts[0].source).toBe('github')
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
