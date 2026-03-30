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

const labeledPrompts: Prompt[] = [
  {
    id: '1',
    name: 'summarize',
    label: 'claude',
    body: 'Summarize this',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: '2',
    name: 'draft',
    label: 'writing',
    body: 'Draft an email',
    createdAt: 0,
    updatedAt: 0,
  },
  {
    id: '3',
    name: 'fix-grammar',
    body: 'Fix grammar',
    createdAt: 0,
    updatedAt: 0,
  },
]

const mockUsePrompts = {
  prompts: mockPrompts,
  isLoading: false,
  hasEverHadPrompts: true,
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

  it('should not show label filter button when no prompts have labels', () => {
    render(<PromptLibrary />)

    expect(
      screen.queryByRole('button', { name: /label/i }),
    ).not.toBeInTheDocument()
  })

  it('should show label filter button when labeled prompts exist', () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)

    expect(screen.getByRole('button', { name: /label/i })).toBeInTheDocument()
  })

  it('should open popover with label checkboxes when filter button is clicked', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))

    expect(
      screen.getByRole('checkbox', { name: /claude/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: /writing/i }),
    ).toBeInTheDocument()
  })

  it('should show Unlabeled checkbox when unlabeled prompts exist', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))

    expect(
      screen.getByRole('checkbox', { name: /unlabeled/i }),
    ).toBeInTheDocument()
  })

  it('should not show Unlabeled checkbox when all prompts have labels', async () => {
    mockUsePrompts.prompts = labeledPrompts.filter((p) => p.label)
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))

    expect(
      screen.queryByRole('checkbox', { name: /unlabeled/i }),
    ).not.toBeInTheDocument()
  })

  it('should filter to only unlabeled prompts when Unlabeled checkbox is checked', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))
    await user.click(screen.getByRole('checkbox', { name: /unlabeled/i }))

    expect(screen.getByText('fix-grammar')).toBeInTheDocument()
    expect(screen.queryByText('summarize')).not.toBeInTheDocument()
    expect(screen.queryByText('draft')).not.toBeInTheDocument()
  })

  it('should filter to only labeled prompts when a label checkbox is checked', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))
    await user.click(screen.getByRole('checkbox', { name: /claude/i }))

    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.queryByText('draft')).not.toBeInTheDocument()
    expect(screen.queryByText('fix-grammar')).not.toBeInTheDocument()
  })

  it('should show badge count on filter button when filters are active', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))
    await user.click(screen.getByRole('checkbox', { name: /claude/i }))

    expect(
      screen.getByRole('button', { name: /label.*1/i }),
    ).toBeInTheDocument()
  })

  it('should show all prompts when all checkboxes are unchecked', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))
    await user.click(screen.getByRole('checkbox', { name: /claude/i }))
    await user.click(screen.getByRole('checkbox', { name: /claude/i }))

    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
    expect(screen.getByText('fix-grammar')).toBeInTheDocument()
  })

  it('should allow multiple label checkboxes to be active simultaneously', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))
    await user.click(screen.getByRole('checkbox', { name: /claude/i }))
    await user.click(screen.getByRole('checkbox', { name: /writing/i }))

    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
    expect(screen.queryByText('fix-grammar')).not.toBeInTheDocument()
  })

  it('should apply text search and label filter together with AND logic', async () => {
    mockUsePrompts.prompts = labeledPrompts
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /label/i }))
    await user.click(screen.getByRole('checkbox', { name: /claude/i }))
    await user.keyboard('{Escape}')
    await user.type(screen.getByPlaceholderText(/search prompts/i), 'sum')

    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.queryByText('draft')).not.toBeInTheDocument()
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

    await waitFor(() => {
      expect(screen.getByText(/set up in options/i)).toBeInTheDocument()
    })
    expect(
      screen.queryByPlaceholderText(/search prompts/i),
    ).not.toBeInTheDocument()
  })
})
