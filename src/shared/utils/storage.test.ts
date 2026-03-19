import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Prompt, Settings } from '@/shared/types'
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

describe('storage utilities', () => {
  beforeEach(() => {
    mockStorage.clear()
    listeners = []
    vi.clearAllMocks()
  })

  it('should manage prompts', async () => {
    const prompt: Prompt = {
      id: '1',
      name: 'test',
      body: 'body',
      createdAt: 100,
      updatedAt: 100,
    }
    await storage.setPrompts([prompt])
    const retrieved = await storage.getPrompts()
    expect(retrieved).toEqual([prompt])
  })

  it('should manage settings with defaults', async () => {
    const settings: Settings = {
      sites: { 'example.com': { triggerSymbol: '/', enabled: true } },
    }
    await storage.setSettings(settings)
    const retrieved = await storage.getSettings()
    expect(retrieved).toEqual(settings)
  })

  it('should return empty default arrays or objects if nothing is stored', async () => {
    const prompts = await storage.getPrompts()
    const settings = await storage.getSettings()
    expect(prompts).toEqual([])
    expect(settings).toEqual({ sites: {} })
  })
})
