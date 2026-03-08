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

  it('should switch to new form when create is clicked', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /new/i }))

    expect(screen.getByText('New Prompt')).toBeInTheDocument()
    expect(screen.getByLabelText(/trigger name/i)).toHaveValue('')
  })

  it('should switch to edit form with correct prompt pre-populated', async () => {
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getAllByRole('button', { name: /edit prompt/i })[0])

    expect(screen.getByText('Edit Prompt')).toBeInTheDocument()
    expect(screen.getByLabelText(/trigger name/i)).toHaveValue('summarize')
    expect(screen.getByLabelText(/prompt body/i)).toHaveValue('Summarize this')
  })

  it('should call addPrompt and return to list on save when creating', async () => {
    mockAddPrompt.mockResolvedValue(undefined)
    render(<PromptLibrary />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /new/i }))
    await user.type(screen.getByLabelText(/trigger name/i), 'new-prompt')
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

    await user.click(screen.getAllByRole('button', { name: /edit prompt/i })[0])
    await user.clear(screen.getByLabelText(/trigger name/i))
    await user.type(screen.getByLabelText(/trigger name/i), 'updated-name')
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
})
