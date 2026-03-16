import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PromptLibrary } from '@/shared/components/prompt-library'
import type { Prompt } from '@/shared/types'

const mockAddPrompt = vi.fn()
const mockUpdatePrompt = vi.fn()
const mockDeletePrompt = vi.fn()

const mockPrompts: Prompt[] = [
  {
    id: '1',
    name: 'summarize',
    body: 'Summarize this',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: '2',
    name: 'refactor',
    body: 'Refactor this',
    createdAt: 0,
    updatedAt: 0,
  },
]

const mockUsePrompts = {
  prompts: mockPrompts,
  isLoading: false,
  addPrompt: mockAddPrompt,
  updatePrompt: mockUpdatePrompt,
  deletePrompt: mockDeletePrompt,
}

vi.mock('@/shared/hooks/use-prompts', () => ({
  usePrompts: () => mockUsePrompts,
}))

vi.mock('@/shared/hooks/use-settings', () => ({
  useSettings: () => ({
    settings: { sites: {} },
    isLoading: false,
    updateSettings: vi.fn(),
    updateSiteSettings: vi.fn(),
  }),
}))

vi.mock('@/shared/hooks/use-github-sync', () => ({
  useGithubSync: () => ({
    status: 'idle',
    diff: null,
    error: null,
    config: null,
    sync: vi.fn(),
    applySync: vi.fn(),
    cancelSync: vi.fn(),
  }),
}))

vi.stubGlobal('chrome', {
  runtime: { openOptionsPage: vi.fn() },
})

describe('PromptLibrary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePrompts.prompts = mockPrompts
    mockUsePrompts.isLoading = false
  })

  it('should render list view by default', () => {
    render(<PromptLibrary />)
    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.getByText('refactor')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    mockUsePrompts.isLoading = true
    render(<PromptLibrary />)
    expect(screen.getByText(/loading prompts/i)).toBeInTheDocument()
  })

  it('should switch to new form when New is clicked', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /new/i }))

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('')
  })

  it('should switch to edit form with correct prompt pre-populated', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByText('summarize'))

    expect(screen.getByLabelText(/^name$/i)).toHaveValue('summarize')
    expect(screen.getByLabelText(/prompt body/i)).toHaveValue('Summarize this')
  })

  it('should call addPrompt and return to list on save when creating', async () => {
    mockAddPrompt.mockResolvedValue(undefined)
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /new/i }))
    await user.type(screen.getByLabelText(/^name$/i), 'new-prompt')
    await user.type(screen.getByLabelText(/prompt body/i), 'New body')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(mockAddPrompt).toHaveBeenCalledWith({
      name: 'new-prompt',
      body: 'New body',
    })
    await waitFor(() => {
      expect(screen.getByText('summarize')).toBeInTheDocument()
    })
  })

  it('should call updatePrompt with correct id on save when editing', async () => {
    mockUpdatePrompt.mockResolvedValue(undefined)
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByText('summarize'))
    await user.clear(screen.getByLabelText(/^name$/i))
    await user.type(screen.getByLabelText(/^name$/i), 'updated-name')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(mockUpdatePrompt).toHaveBeenCalledWith('1', {
      name: 'updated-name',
      body: 'Summarize this',
    })
    await waitFor(() => {
      expect(screen.getByText('summarize')).toBeInTheDocument()
    })
  })

  it('should return to list without saving when cancel is clicked', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /new/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(mockAddPrompt).not.toHaveBeenCalled()
    expect(screen.getByText('summarize')).toBeInTheDocument()
  })

  it('should return to list without saving when ← Back is clicked', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /new/i }))
    await user.click(screen.getByText(/← back/i))

    expect(mockAddPrompt).not.toHaveBeenCalled()
    expect(screen.getByText('summarize')).toBeInTheDocument()
  })

  it('should filter prompts as search query changes', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText(/search prompts/i), 'sum')

    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.queryByText('refactor')).not.toBeInTheDocument()
  })

  it('should switch to GitHub tab and show setup placeholder', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /github/i }))

    expect(screen.getByText(/set up in options/i)).toBeInTheDocument()
    expect(
      screen.queryByPlaceholderText(/search prompts/i),
    ).not.toBeInTheDocument()
  })
})
