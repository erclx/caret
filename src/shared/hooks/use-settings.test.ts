import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSettings } from '@/shared/hooks/use-settings'

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

describe('useSettings', () => {
  beforeEach(() => {
    mockStorage.clear()
    listeners = []
    vi.clearAllMocks()
  })

  it('should read and update settings using useSettings', async () => {
    const { result } = renderHook(() => useSettings())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.updateSiteSettings('example.com', {
        triggerSymbol: '>',
        enabled: false,
      })
    })

    await waitFor(() => {
      expect(result.current.settings.sites['example.com']).toEqual({
        triggerSymbol: '>',
        enabled: false,
      })
    })
  })
})
