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

function makeFileEntry(name: string, path = 'snippets') {
  return {
    name,
    type: 'file',
    download_url: `https://raw.githubusercontent.com/testuser/snippets/main/${path}/${name}`,
  }
}

function makeDirEntry(name: string) {
  return { name, type: 'dir', download_url: null }
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
        json: async () => [makeFileEntry('summarize.md')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Summarize the following text.',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets).toEqual([
        {
          name: 'summarize',
          body: 'Summarize the following text.',
          label: undefined,
        },
      ])
    }
  })

  it('should strip the .md extension to derive the slug', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeFileEntry('fix-grammar.md')],
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
          makeFileEntry('summarize.md'),
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
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
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
        'Check the repository, branch, and snippets path.',
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
      expect(result.error).toBe('Check that your token has repo read access.')
    }
  })

  it('should return an error when a file fetch fails', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeFileEntry('summarize.md')],
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
        json: async () => [makeFileEntry('summarize.md')],
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

  it('should recurse into subdirectories and assign the folder name as label', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeDirEntry('claude')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeFileEntry('summarize.md', 'snippets/claude')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Summarize this.',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets).toHaveLength(1)
      expect(result.snippets[0]).toEqual({
        name: 'summarize',
        body: 'Summarize this.',
        label: 'claude',
      })
    }
  })

  it('should fetch both root snippets and subdirectory snippets', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          makeFileEntry('fix-grammar.md'),
          makeDirEntry('claude'),
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Fix grammar.',
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeFileEntry('summarize.md', 'snippets/claude')],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'Summarize this.',
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.snippets).toHaveLength(2)
      const names = result.snippets.map((s) => s.name)
      expect(names).toContain('fix-grammar')
      expect(names).toContain('summarize')
      const labeled = result.snippets.find((s) => s.name === 'summarize')
      expect(labeled?.label).toBe('claude')
      const unlabeled = result.snippets.find((s) => s.name === 'fix-grammar')
      expect(unlabeled?.label).toBeUndefined()
    }
  })

  it('should return an error when a subdirectory fetch fails', async () => {
    const mockFetch = vi.mocked(fetch)

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [makeDirEntry('claude')],
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

    const result = await fetchSnippets(mockConfig)

    expect(result.ok).toBe(false)
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
      expect(result.error).toBe('Check that your token has repo read access.')
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
        'Check the repository, branch, and snippets path.',
      )
    }
  })

  it('should return a network error when fetch throws', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network failure'))

    const result = await testConnection(mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Check your internet connection.')
    }
  })
})

describe('computeDiff', () => {
  it('should mark all incoming as added when current is empty', () => {
    const result = computeDiff([], [{ name: 'new-prompt', body: 'body' }])

    expect(result.added).toEqual([{ name: 'new-prompt', label: undefined }])
    expect(result.updated).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
    expect(result.unchanged).toHaveLength(0)
  })

  it('should mark prompts as unchanged when composite key and body match', () => {
    const current = [makePrompt({ name: 'summarize', body: 'Summarize this.' })]
    const incoming = [{ name: 'summarize', body: 'Summarize this.' }]

    const result = computeDiff(current, incoming)

    expect(result.unchanged).toEqual([{ name: 'summarize', label: undefined }])
    expect(result.added).toHaveLength(0)
    expect(result.updated).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })

  it('should mark a prompt as updated when the body differs', () => {
    const current = [makePrompt({ name: 'summarize', body: 'old body' })]
    const incoming = [{ name: 'summarize', body: 'new body' }]

    const result = computeDiff(current, incoming)

    expect(result.updated).toEqual([{ name: 'summarize', label: undefined }])
    expect(result.unchanged).toHaveLength(0)
  })

  it('should mark current prompts not in incoming as removed', () => {
    const current = [makePrompt({ name: 'old-prompt' })]
    const incoming = [{ name: 'new-prompt', body: 'body' }]

    const result = computeDiff(current, incoming)

    expect(result.removed).toEqual([{ name: 'old-prompt', label: undefined }])
    expect(result.added).toEqual([{ name: 'new-prompt', label: undefined }])
  })

  it('should mark incoming as skipped when composite key matches a local prompt with a different body', () => {
    const localKeys = new Map([['\x00chat-mode', 'local body']])
    const result = computeDiff(
      [],
      [{ name: 'chat-mode', body: 'github body' }],
      localKeys,
    )

    expect(result.skipped).toEqual([{ name: 'chat-mode', label: undefined }])
    expect(result.added).toHaveLength(0)
  })

  it('should mark incoming as unchanged when composite key and body match a local prompt', () => {
    const localKeys = new Map([['\x00chat-mode', 'same body']])
    const result = computeDiff(
      [],
      [{ name: 'chat-mode', body: 'same body' }],
      localKeys,
    )

    expect(result.unchanged).toEqual([{ name: 'chat-mode', label: undefined }])
    expect(result.skipped).toHaveLength(0)
    expect(result.added).toHaveLength(0)
  })

  it('should add incoming prompts not in localKeys even when localKeys is provided', () => {
    const localKeys = new Map([['\x00local-only', 'body']])
    const result = computeDiff(
      [],
      [{ name: 'new-prompt', body: 'body' }],
      localKeys,
    )

    expect(result.added).toEqual([{ name: 'new-prompt', label: undefined }])
    expect(result.skipped).toHaveLength(0)
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

    expect(result.unchanged).toEqual([{ name: 'unchanged', label: undefined }])
    expect(result.updated).toEqual([{ name: 'updated', label: undefined }])
    expect(result.removed).toEqual([{ name: 'removed', label: undefined }])
    expect(result.added).toEqual([{ name: 'added', label: undefined }])
  })

  it('should treat same name with different labels as distinct composite keys', () => {
    const current = [
      makePrompt({ name: 'summarize', label: 'claude', body: 'body' }),
    ]
    const incoming = [{ name: 'summarize', label: 'writing', body: 'body' }]

    const result = computeDiff(current, incoming)

    expect(result.added).toEqual([{ name: 'summarize', label: 'writing' }])
    expect(result.removed).toEqual([{ name: 'summarize', label: 'claude' }])
    expect(result.unchanged).toHaveLength(0)
  })

  it('should match labeled prompts by composite key', () => {
    const current = [
      makePrompt({ name: 'summarize', label: 'claude', body: 'old' }),
    ]
    const incoming = [{ name: 'summarize', label: 'claude', body: 'new' }]

    const result = computeDiff(current, incoming)

    expect(result.updated).toEqual([{ name: 'summarize', label: 'claude' }])
    expect(result.added).toHaveLength(0)
    expect(result.removed).toHaveLength(0)
  })
})
