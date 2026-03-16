import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Prompt } from '@/shared/types'
import {
  computeDiff,
  fetchSnippets,
  testConnection,
  validateOwnerRepo,
} from '@/shared/utils/github'

const mockConfig = {
  pat: 'ghp_test',
  owner: 'testuser',
  repo: 'snippets',
  branch: 'main',
  snippetsPath: 'snippets',
}

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: 'id',
    name: 'test',
    body: 'body',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

function makeDirectoryEntry(name: string) {
  return {
    name,
    type: 'file',
    download_url: `https://raw.githubusercontent.com/testuser/snippets/main/snippets/${name}`,
  }
}

describe('fetchSnippets', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return parsed snippets for a valid directory', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeDirectoryEntry('summarize.md')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Summarize the following text.',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets).toEqual([
        { name: 'summarize', body: 'Summarize the following text.' },
      ])
    }
  })

  it('should strip the .md extension to derive the slug', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeDirectoryEntry('fix-grammar.md')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Fix grammar.',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets[0].name).toBe('fix-grammar')
    }
  })

  it('should filter out non-.md files from the directory listing', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          makeDirectoryEntry('summarize.md'),
          {
            name: 'README.txt',
            type: 'file',
            download_url: 'https://example.com/README.txt',
          },
          { name: 'images', type: 'dir', download_url: null },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Summarize.',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets).toHaveLength(1)
      expect(result.snippets[0].name).toBe('summarize')
    }
  })

  it('should return a not-found error when the directory request returns 404', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'Repository, branch, or snippets path not found',
      )
    }
  })

  it('should return an invalid-token error when the directory request returns 401', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'Invalid token — check your PAT has repo read access',
      )
    }
  })

  it('should return an error when a file fetch fails', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeDirectoryEntry('summarize.md')],
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 403,
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(false)
  })

  it('should trim whitespace from fetched file content', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeDirectoryEntry('summarize.md')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '  Summarize the text.  \n',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets[0].body).toBe('Summarize the text.')
    }
  })
})

describe('validateOwnerRepo', () => {
  it('should return null for a valid owner/repo value', () => {
    expect(validateOwnerRepo('octocat/my-snippets')).toBeNull()
  })

  it('should return an error for a value with no slash', () => {
    expect(validateOwnerRepo('octocat')).not.toBeNull()
  })

  it('should return an error for a value with only a slash', () => {
    expect(validateOwnerRepo('/')).not.toBeNull()
  })

  it('should return an error when the owner segment is empty', () => {
    expect(validateOwnerRepo('/repo')).not.toBeNull()
  })

  it('should return an error when the repo segment is empty', () => {
    expect(validateOwnerRepo('owner/')).not.toBeNull()
  })

  it('should return null for names with hyphens, underscores, and dots', () => {
    expect(validateOwnerRepo('my-org/my.repo_name')).toBeNull()
  })
})

describe('testConnection', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return ok when the request succeeds', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response)

    const result = await testConnection(mockConfig)

    expect(result.ok).toBe(true)
  })

  it('should return a token error on 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 401,
    } as Response)

    const result = await testConnection(mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'Invalid token — check your PAT has repo read access',
      )
    }
  })

  it('should return a not-found error on 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const result = await testConnection(mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe(
        'Repository, branch, or snippets path not found',
      )
    }
  })

  it('should return a network error when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))

    const result = await testConnection(mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Network error — check your connection')
    }
  })
})

describe('computeDiff', () => {
  it('should mark all incoming as added when current is empty', () => {
    const result = computeDiff([], [{ name: 'new-prompt', body: 'body' }])

    expect(result.added).toEqual(['new-prompt'])
    expect(result.updated).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
    expect(result.unchanged).toHaveLength(0)
  })

  it('should mark prompts as unchanged when name and body match', () => {
    const current = [makePrompt({ name: 'summarize', body: 'Summarize this.' })]
    const incoming = [{ name: 'summarize', body: 'Summarize this.' }]

    const result = computeDiff(current, incoming)

    expect(result.unchanged).toEqual(['summarize'])
    expect(result.added).toHaveLength(0)
    expect(result.updated).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  it('should mark a prompt as updated when the body differs', () => {
    const current = [makePrompt({ name: 'summarize', body: 'old body' })]
    const incoming = [{ name: 'summarize', body: 'new body' }]

    const result = computeDiff(current, incoming)

    expect(result.updated).toEqual(['summarize'])
    expect(result.unchanged).toHaveLength(0)
  })

  it('should mark current prompts not in incoming as removed', () => {
    const current = [makePrompt({ name: 'old-prompt' })]
    const incoming = [{ name: 'new-prompt', body: 'body' }]

    const result = computeDiff(current, incoming)

    expect(result.removed).toEqual(['old-prompt'])
    expect(result.added).toEqual(['new-prompt'])
  })

  it('should handle a mix of added, updated, removed, and unchanged', () => {
    const current = [
      makePrompt({ name: 'unchanged', body: 'same' }),
      makePrompt({ name: 'updated', body: 'old' }),
      makePrompt({ name: 'removed', body: 'gone' }),
    ]
    const incoming = [
      { name: 'unchanged', body: 'same' },
      { name: 'updated', body: 'new' },
      { name: 'added', body: 'fresh' },
    ]

    const result = computeDiff(current, incoming)

    expect(result.unchanged).toEqual(['unchanged'])
    expect(result.updated).toEqual(['updated'])
    expect(result.removed).toEqual(['removed'])
    expect(result.added).toEqual(['added'])
  })
})
