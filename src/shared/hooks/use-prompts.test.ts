import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { usePrompts } from '@/shared/hooks/use-prompts'

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
              if (mockStorage.has(k)) {
                res[k] = mockStorage.get(k)
              }
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

describe('usePrompts', () => {
  beforeEach(() => {
    mockStorage.clear()
    listeners = []
    vi.clearAllMocks()
  })

  it('should read, create, update, and delete prompts using usePrompts', async () => {
    const { result } = renderHook(() => usePrompts())

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.addPrompt({ name: 'new', body: 'content' })
    })

    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(1)
      expect(result.current.prompts[0].name).toBe('new')
    })

    const promptId = result.current.prompts[0].id

    await act(async () => {
      await result.current.updatePrompt(promptId, { name: 'updated' })
    })

    await waitFor(() => {
      expect(result.current.prompts[0].name).toBe('updated')
    })

    await act(async () => {
      await result.current.deletePrompt(promptId)
    })

    await waitFor(() => {
      expect(result.current.prompts).toHaveLength(0)
    })
  })
})
