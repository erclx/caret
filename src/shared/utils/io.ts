import { z } from 'zod'

import type { Prompt } from '@/shared/types'
import { PromptSchema } from '@/shared/types'

type ParseResult =
  | { ok: true; prompts: Prompt[] }
  | { ok: false; error: string }

type MergeResult = {
  merged: Prompt[]
  added: number
  updated: number
}

export function exportPrompts(prompts: Prompt[]): void {
  const json = JSON.stringify(prompts, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'caret-backup.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export function parseImport(text: string): ParseResult {
  let parsed: unknown

  try {
    parsed = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Invalid JSON file.' }
  }

  const result = z.array(PromptSchema).safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      error: 'File does not match the expected prompt format.',
    }
  }

  return { ok: true, prompts: result.data }
}

export function mergePrompts(
  existing: Prompt[],
  incoming: Prompt[],
): MergeResult {
  const merged = [...existing]
  let added = 0
  let updated = 0

  for (const prompt of incoming) {
    const index = merged.findIndex((p) => p.name === prompt.name)

    if (index !== -1) {
      // last-write-wins: incoming body overwrites existing, existing id preserved
      merged[index] = {
        ...merged[index],
        body: prompt.body,
        updatedAt: Date.now(),
      }
      updated++
    } else {
      // new prompt: preserve original timestamps, generate fresh id to avoid collisions
      merged.push({ ...prompt, id: crypto.randomUUID() })
      added++
    }
  }

  return { merged, added, updated }
}
