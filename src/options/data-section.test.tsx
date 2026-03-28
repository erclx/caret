import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DataSection } from '@/options/data-section'
import type { Prompt } from '@/shared/types'

const { mockImportPrompts, mockExportPrompts } = vi.hoisted(() => ({
  mockImportPrompts: vi.fn(),
  mockExportPrompts: vi.fn(),
}))

const PROMPTS: Prompt[] = [
  {
    id: '1',
    name: 'summarize',
    body: 'Summarize this',
    createdAt: 0,
    updatedAt: 0,
  },
]

vi.mock('@/shared/hooks/use-prompts', () => ({
  usePrompts: () => ({
    prompts: PROMPTS,
    importPrompts: mockImportPrompts,
  }),
}))

vi.mock('@/shared/utils/io', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/utils/io')>()
  return { ...actual, exportPrompts: mockExportPrompts }
})

function makeFile(content: string): File {
  return new File([content], 'prompts.json', { type: 'application/json' })
}

function makePrompt(overrides: Partial<Prompt> = {}): Prompt {
  return {
    id: '1',
    name: 'test',
    body: 'body',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

function renderSection() {
  const user = userEvent.setup()
  render(<DataSection />)
  const fileInput = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement
  return { user, fileInput }
}

describe('DataSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockImportPrompts.mockResolvedValue({ addedNames: [], updatedNames: [] })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('export', () => {
    it('should call exportPrompts with current prompts when export button is clicked', async () => {
      const { user } = renderSection()

      await user.click(screen.getByRole('button', { name: /export prompts/i }))

      expect(mockExportPrompts).toHaveBeenCalledWith(PROMPTS)
    })
  })

  describe('import', () => {
    it('should show an error when the file contains invalid JSON', async () => {
      const { user, fileInput } = renderSection()

      await user.upload(fileInput, makeFile('not valid json {'))

      await waitFor(() => {
        expect(
          screen.getByText('Select a valid JSON file.'),
        ).toBeInTheDocument()
      })
    })

    it('should show an error when the file contains no prompts', async () => {
      const { user, fileInput } = renderSection()

      await user.upload(fileInput, makeFile('[]'))

      await waitFor(() => {
        expect(
          screen.getByText('Select a file with at least one prompt.'),
        ).toBeInTheDocument()
      })
    })

    it('should show "Added" count and name after a successful import', async () => {
      mockImportPrompts.mockResolvedValue({
        addedNames: ['summarize'],
        updatedNames: [],
      })
      const { user, fileInput } = renderSection()

      await user.upload(fileInput, makeFile(JSON.stringify(PROMPTS)))

      await waitFor(() => {
        expect(screen.getByText('Added 1: summarize.')).toBeInTheDocument()
      })
    })

    it('should show "Updated" count and name after a successful import', async () => {
      mockImportPrompts.mockResolvedValue({
        addedNames: [],
        updatedNames: ['summarize'],
      })
      const { user, fileInput } = renderSection()

      await user.upload(fileInput, makeFile(JSON.stringify(PROMPTS)))

      await waitFor(() => {
        expect(screen.getByText('Updated 1: summarize.')).toBeInTheDocument()
      })
    })

    it('should show combined feedback when import has both updated and added', async () => {
      mockImportPrompts.mockResolvedValue({
        addedNames: ['new-prompt'],
        updatedNames: ['summarize'],
      })
      const prompts = [
        makePrompt({ id: '1', name: 'summarize' }),
        makePrompt({ id: '2', name: 'new-prompt' }),
      ]
      const { user, fileInput } = renderSection()

      await user.upload(fileInput, makeFile(JSON.stringify(prompts)))

      await waitFor(() => {
        expect(
          screen.getByText('Updated 1: summarize. Added 1: new-prompt.'),
        ).toBeInTheDocument()
      })
    })

    it('should show up-to-date message when import produces no changes', async () => {
      mockImportPrompts.mockResolvedValue({
        addedNames: [],
        updatedNames: [],
      })
      const { user, fileInput } = renderSection()

      await user.upload(fileInput, makeFile(JSON.stringify(PROMPTS)))

      await waitFor(() => {
        expect(
          screen.getByText('All prompts are already up to date.'),
        ).toBeInTheDocument()
      })
    })

    it('should clear import feedback after the auto-dismiss timeout', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const user = userEvent.setup()
      mockImportPrompts.mockResolvedValue({
        addedNames: ['summarize'],
        updatedNames: [],
      })
      render(<DataSection />)
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement

      await user.upload(fileInput, makeFile(JSON.stringify(PROMPTS)))

      await waitFor(() => {
        expect(screen.getByText('Added 1: summarize.')).toBeInTheDocument()
      })

      await act(async () => {
        vi.advanceTimersByTime(3001)
      })

      expect(screen.queryByText('Added 1: summarize.')).not.toBeInTheDocument()

      vi.useRealTimers()
    })
  })
})
