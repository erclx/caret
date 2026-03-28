import { z } from 'zod'

import type { Prompt } from '@/shared/types'
import { PromptSchema } from '@/shared/types'

type ParseResult =
  | { ok: true; prompts: Prompt[] }
  | { ok: false; error: string }

interface MergeResult {
  merged: Prompt[]
  addedNames: string[]
  updatedNames: string[]
}

function compositeKey(label: string | undefined, name: string): string {
  return `${label ?? ''}\x00${name}`
}

function displayName(label: string | undefined, name: string): string {
  return label ? `${label} · ${name}` : name
}

function truncateNames(names: string[]): string {
  if (names.length <= 3) return names.join(', ')
  const rest = names.length - 3
  return `${names.slice(0, 3).join(', ')} and ${rest} more`
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

  const indexByKey = new Map(
    merged.map((p, i) => [compositeKey(p.label, p.name), i]),
  )

  for (const prompt of incoming) {
    const key = compositeKey(prompt.label, prompt.name)
    const label = displayName(prompt.label, prompt.name)
    const index = indexByKey.get(key) ?? -1

    if (index !== -1) {
      merged[index] = {
        ...merged[index],
        body: prompt.body,
        label: prompt.label,
        updatedAt: Date.now(),
      }
      updatedNames.push(label)
    } else {
      merged.push({ ...prompt, id: crypto.randomUUID() })
      indexByKey.set(key, merged.length - 1)
      addedNames.push(label)
    }
  }

  return { merged, addedNames, updatedNames }
}

export function formatImportFeedback(
  addedNames: string[],
  updatedNames: string[],
): string {
  if (addedNames.length === 0 && updatedNames.length === 0)
    return 'All prompts are already up to date.'
  const parts: string[] = []
  if (updatedNames.length > 0)
    parts.push(
      `Updated ${updatedNames.length}: ${truncateNames(updatedNames)}.`,
    )
  if (addedNames.length > 0)
    parts.push(`Added ${addedNames.length}: ${truncateNames(addedNames)}.`)
  return parts.join(' ')
}
