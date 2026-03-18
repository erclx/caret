import { z } from 'zod'

import type { Prompt } from '@/shared/types'
import { PromptSchema } from '@/shared/types'

type ParseResult =
  | { ok: true; prompts: Prompt[] }
  | { ok: false; error: string }

type MergeResult = {
  merged: Prompt[]
  addedNames: string[]
  updatedNames: string[]
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
    return { ok: false, error: 'Select a valid JSON file.' }
  }

  const result = z.array(PromptSchema).safeParse(parsed)
  if (!result.success) {
    return {
      ok: false,
      error: 'Use a JSON file exported from Caret.',
    }
  }

  return { ok: true, prompts: result.data }
}

export function mergePrompts(
  existing: Prompt[],
  incoming: Prompt[],
): MergeResult {
  const merged = [...existing]
  const addedNames: string[] = []
  const updatedNames: string[] = []

  for (const prompt of incoming) {
    const index = merged.findIndex((p) => p.name === prompt.name)

    if (index !== -1) {
      // last-write-wins: incoming body overwrites existing, existing id preserved
      merged[index] = {
        ...merged[index],
        body: prompt.body,
        updatedAt: Date.now(),
      }
      updatedNames.push(prompt.name)
    } else {
      // new prompt: preserve original timestamps, generate fresh id to avoid collisions
      merged.push({ ...prompt, id: crypto.randomUUID() })
      addedNames.push(prompt.name)
    }
  }

  return { merged, addedNames, updatedNames }
}

export function formatImportFeedback(
  addedNames: string[],
  updatedNames: string[],
): string {
  const parts: string[] = []
  if (updatedNames.length > 0)
    parts.push(`Updated: ${updatedNames.join(', ')}.`)
  if (addedNames.length > 0) parts.push(`Added: ${addedNames.join(', ')}.`)
  return parts.join(' ')
}
