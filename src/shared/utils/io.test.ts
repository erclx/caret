import { describe, expect, it } from 'vitest'

import type { Prompt } from '@/shared/types'
import { mergePrompts, parseImport } from '@/shared/utils/io'

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: 'test-id',
    name: 'test',
    body: 'test body',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  }
}

describe('parseImport', () => {
  it('should return prompts for a valid JSON array', () => {
    const prompt = makePrompt()
    const result = parseImport(JSON.stringify([prompt]))
    expect(result).toEqual({ ok: true, prompts: [prompt] })
  })

  it('should return an error for malformed JSON', () => {
    const result = parseImport('not json {')
    expect(result).toEqual({ ok: false, error: 'Invalid JSON file.' })
  })

  it('should return an error when schema validation fails', () => {
    const result = parseImport(JSON.stringify([{ foo: 'bar' }]))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'File does not match the expected prompt format.',
      )
    }
  })

  it('should return an empty array for an empty JSON array', () => {
    const result = parseImport(JSON.stringify([]))
    expect(result).toEqual({ ok: true, prompts: [] })
  })
})

describe('mergePrompts', () => {
  it('should add all incoming prompts when there are no name conflicts', () => {
    const existing = [makePrompt({ id: 'e1', name: 'existing' })]
    const incoming = [makePrompt({ id: 'i1', name: 'new-prompt' })]

    const { merged, added, updated } = mergePrompts(existing, incoming)

    expect(added).toBe(1)
    expect(updated).toBe(0)
    expect(merged).toHaveLength(2)
  })

  it('should overwrite the body of an existing prompt with the same name (last-write-wins)', () => {
    const existing = [
      makePrompt({ id: 'e1', name: 'summarize', body: 'old body' }),
    ]
    const incoming = [
      makePrompt({ id: 'i1', name: 'summarize', body: 'new body' }),
    ]

    const { merged, added, updated } = mergePrompts(existing, incoming)

    expect(added).toBe(0)
    expect(updated).toBe(1)
    expect(merged).toHaveLength(1)
    expect(merged[0].body).toBe('new body')
  })

  it('should preserve the existing id when updating a duplicate', () => {
    const existing = [makePrompt({ id: 'keep-this-id', name: 'test' })]
    const incoming = [
      makePrompt({ id: 'discard-this-id', name: 'test', body: 'updated' }),
    ]

    const { merged } = mergePrompts(existing, incoming)

    expect(merged[0].id).toBe('keep-this-id')
  })

  it('should handle a mix of new and duplicate prompts correctly', () => {
    const existing = [makePrompt({ id: 'e1', name: 'existing' })]
    const incoming = [
      makePrompt({ name: 'existing', body: 'updated body' }),
      makePrompt({ name: 'brand-new' }),
    ]

    const { added, updated, merged } = mergePrompts(existing, incoming)

    expect(added).toBe(1)
    expect(updated).toBe(1)
    expect(merged).toHaveLength(2)
  })

  it('should generate a fresh id for incoming prompts that are new', () => {
    const existing: Prompt[] = []
    const incoming = [makePrompt({ id: 'original-id', name: 'new' })]

    const { merged } = mergePrompts(existing, incoming)

    expect(merged[0].id).not.toBe('original-id')
  })
})
