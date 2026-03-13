import type { GithubSettings, Prompt } from '@/shared/types'

export type Snippet = { name: string; body: string }

export type DiffResult = {
  added: string[]
  updated: string[]
  removed: string[]
  unchanged: string[]
}

type FetchResult =
  | { ok: true; snippets: Snippet[] }
  | { ok: false; error: string }

type DirectoryEntry = {
  name: string
  type: string
  download_url: string
}

function buildHeaders(pat: string): HeadersInit {
  return pat ? { Authorization: `Bearer ${pat}` } : {}
}

export async function testConnection(config: GithubSettings): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.snippetsPath}?ref=${config.branch}`,
      { headers: buildHeaders(config.pat) },
    )
    return res.ok
  } catch {
    return false
  }
}

export async function fetchSnippets(
  config: GithubSettings,
): Promise<FetchResult> {
  try {
    const headers = buildHeaders(config.pat)

    const dirRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.snippetsPath}?ref=${config.branch}`,
      { headers },
    )

    if (!dirRes.ok) {
      return {
        ok: false,
        error: `Failed to fetch snippets directory (${dirRes.status}).`,
      }
    }

    const entries: unknown = await dirRes.json()

    if (!Array.isArray(entries)) {
      return { ok: false, error: 'Snippets path is not a directory.' }
    }

    const mdFiles = entries.filter(
      (e): e is DirectoryEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as DirectoryEntry).name === 'string' &&
        (e as DirectoryEntry).type === 'file' &&
        (e as DirectoryEntry).name.endsWith('.md') &&
        typeof (e as DirectoryEntry).download_url === 'string',
    )

    const snippets = await Promise.all(
      mdFiles.map(async (file) => {
        const res = await fetch(file.download_url, { headers })
        if (!res.ok) {
          throw new Error(`Failed to fetch ${file.name} (${res.status}).`)
        }
        const body = await res.text()
        return { name: file.name.replace(/\.md$/, ''), body: body.trim() }
      }),
    )

    return { ok: true, snippets }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Network error. Check your connection and try again.'
    return { ok: false, error: message }
  }
}

export function computeDiff(
  current: Prompt[],
  incoming: Snippet[],
): DiffResult {
  const currentMap = new Map(current.map((p) => [p.name, p.body]))
  const incomingMap = new Map(incoming.map((s) => [s.name, s.body]))

  const added: string[] = []
  const updated: string[] = []
  const unchanged: string[] = []
  const removed: string[] = []

  for (const [name, body] of incomingMap) {
    if (!currentMap.has(name)) {
      added.push(name)
    } else if (currentMap.get(name) !== body) {
      updated.push(name)
    } else {
      unchanged.push(name)
    }
  }

  for (const name of currentMap.keys()) {
    if (!incomingMap.has(name)) {
      removed.push(name)
    }
  }

  return { added, updated, removed, unchanged }
}
