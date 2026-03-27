import type { GithubSettings, Prompt } from '@/shared/types'

export type Snippet = { label?: string; name: string; body: string }

export type DiffEntry = { label?: string; name: string }

export type DiffResult = {
  added: DiffEntry[]
  updated: DiffEntry[]
  removed: DiffEntry[]
  unchanged: DiffEntry[]
  skipped: DiffEntry[]
}

type FetchResult =
  | { ok: true; snippets: Snippet[] }
  | { ok: false; error: string }

export type ConnectionResult = { ok: true } | { ok: false; error: string }

type DirectoryEntry = {
  name: string
  type: string
  download_url: string | null
}

export const OWNER_REPO_RE = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/

export function validateOwnerRepo(value: string): string | null {
  return OWNER_REPO_RE.test(value.trim())
    ? null
    : 'Use the format owner/repo (e.g. octocat/my-snippets)'
}

function buildHeaders(pat: string): HeadersInit {
  return pat ? { Authorization: `Bearer ${pat}` } : {}
}

function describeHttpError(status: number): string {
  switch (status) {
    case 401:
      return 'Check that your token has repo read access.'
    case 403:
      return 'Grant your token read access to this repository.'
    case 404:
      return 'Check the repository, branch, and snippets path.'
    default:
      return `Request failed (${status})`
  }
}

function compositeKey(label: string | undefined, name: string): string {
  return `${label ?? ''}\x00${name}`
}

const GITHUB_TIMEOUT_MS = 10_000

export async function testConnection(
  config: GithubSettings,
): Promise<ConnectionResult> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.snippetsPath}?ref=${config.branch}`,
      {
        headers: buildHeaders(config.pat),
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
      },
    )
    if (res.ok) return { ok: true }
    return { ok: false, error: describeHttpError(res.status) }
  } catch {
    return { ok: false, error: 'Check your internet connection.' }
  }
}

export async function fetchSnippets(
  config: GithubSettings,
): Promise<FetchResult> {
  try {
    const headers = buildHeaders(config.pat)

    const dirRes = await fetch(
      `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.snippetsPath}?ref=${config.branch}`,
      { headers, signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS) },
    )

    if (!dirRes.ok) {
      return { ok: false, error: describeHttpError(dirRes.status) }
    }

    const entries: unknown = await dirRes.json()

    if (!Array.isArray(entries)) {
      return { ok: false, error: 'Enter a path to a folder of .md files.' }
    }

    function isMdFile(e: unknown): e is DirectoryEntry {
      return (
        typeof e === 'object' &&
        e !== null &&
        typeof (e as DirectoryEntry).name === 'string' &&
        (e as DirectoryEntry).type === 'file' &&
        (e as DirectoryEntry).name.endsWith('.md') &&
        typeof (e as DirectoryEntry).download_url === 'string'
      )
    }

    function isSubdir(e: unknown): e is DirectoryEntry {
      return (
        typeof e === 'object' &&
        e !== null &&
        typeof (e as DirectoryEntry).name === 'string' &&
        (e as DirectoryEntry).type === 'dir'
      )
    }

    async function fetchMdFile(
      file: DirectoryEntry,
      label?: string,
    ): Promise<Snippet> {
      const res = await fetch(file.download_url as string, {
        signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch ${file.name} (${res.status}).`)
      }
      const body = await res.text()
      return { name: file.name.replace(/\.md$/, ''), body: body.trim(), label }
    }

    async function fetchSubdir(dir: DirectoryEntry): Promise<Snippet[]> {
      const res = await fetch(
        `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.snippetsPath}/${dir.name}?ref=${config.branch}`,
        { headers, signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS) },
      )
      if (!res.ok) {
        throw new Error(
          `Failed to fetch directory ${dir.name} (${res.status}).`,
        )
      }
      const subdirEntries: unknown = await res.json()
      if (!Array.isArray(subdirEntries)) return []
      return Promise.all(
        subdirEntries
          .filter(isMdFile)
          .map((file) => fetchMdFile(file, dir.name)),
      )
    }

    const results = await Promise.all([
      Promise.all(entries.filter(isMdFile).map((file) => fetchMdFile(file))),
      ...entries.filter(isSubdir).map(fetchSubdir),
    ])

    return { ok: true, snippets: results.flat() }
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Check your connection and try again.'
    return { ok: false, error: message }
  }
}

export function computeDiff(
  current: Prompt[],
  incoming: Snippet[],
  localKeys: Set<string> = new Set(),
): DiffResult {
  const currentMap = new Map(
    current.map((p) => [compositeKey(p.label, p.name), p.body]),
  )
  const incomingMap = new Map(
    incoming.map((s) => [
      compositeKey(s.label, s.name),
      { label: s.label, name: s.name, body: s.body },
    ]),
  )

  const added: DiffEntry[] = []
  const updated: DiffEntry[] = []
  const unchanged: DiffEntry[] = []
  const removed: DiffEntry[] = []
  const skipped: DiffEntry[] = []

  for (const [key, { label, name, body }] of incomingMap) {
    if (!currentMap.has(key)) {
      if (localKeys.has(key)) {
        skipped.push({ label, name })
      } else {
        added.push({ label, name })
      }
    } else if (currentMap.get(key) !== body) {
      updated.push({ label, name })
    } else {
      unchanged.push({ label, name })
    }
  }

  for (const p of current) {
    if (!incomingMap.has(compositeKey(p.label, p.name))) {
      removed.push({ label: p.label, name: p.name })
    }
  }

  return { added, updated, removed, unchanged, skipped }
}
