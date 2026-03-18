import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PromptList } from '@/shared/components/prompt-list'
import type { Prompt } from '@/shared/types'

const mockPrompts: Prompt[] = [
  { id: '1', name: 'prompt-1', body: 'Body 1', createdAt: 0, updatedAt: 0 },
  { id: '2', name: 'prompt-2', body: 'Body 2', createdAt: 0, updatedAt: 0 },
]

describe('PromptList', () => {
  it('should render onboarding copy when empty and no prompts have ever been created', () => {
    render(
      <PromptList
        prompts={[]}
        hasQuery={false}
        hasEverHadPrompts={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText(/no prompts yet\./i)).toBeInTheDocument()
    expect(
      screen.getByText(/add one above, then type > in any chat to use it\./i),
    ).toBeInTheDocument()
  })

  it('should render no-prompts copy when empty and prompts have existed before', () => {
    render(
      <PromptList
        prompts={[]}
        hasQuery={false}
        hasEverHadPrompts={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(
      screen.getByText(/no prompts yet, click \+ new to add one/i),
    ).toBeInTheDocument()
  })

  it('should render empty state with no-results copy when hasQuery is true', () => {
    render(
      <PromptList
        prompts={[]}
        hasQuery={true}
        hasEverHadPrompts={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText(/no prompts found/i)).toBeInTheDocument()
  })

  it('should call onEdit when a prompt row is clicked', async () => {
    const handleEdit = vi.fn()
    render(
      <PromptList
        prompts={mockPrompts}
        hasQuery={false}
        hasEverHadPrompts={true}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.click(screen.getByText('prompt-1'))

    expect(handleEdit).toHaveBeenCalledWith(mockPrompts[0])
  })

  it('should require inline confirmation before triggering delete', async () => {
    const handleDelete = vi.fn()
    render(
      <PromptList
        prompts={mockPrompts}
        hasQuery={false}
        hasEverHadPrompts={true}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />,
    )
    const user = userEvent.setup()

    await user.click(
      screen.getAllByRole('button', { name: /delete prompt/i })[0],
    )

    expect(handleDelete).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /confirm delete/i }))

    expect(handleDelete).toHaveBeenCalledWith('1')
  })

  it('should not trigger onEdit when the delete button is clicked', async () => {
    const handleEdit = vi.fn()
    render(
      <PromptList
        prompts={mockPrompts}
        hasQuery={false}
        hasEverHadPrompts={true}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.click(
      screen.getAllByRole('button', { name: /delete prompt/i })[0],
    )

    expect(handleEdit).not.toHaveBeenCalled()
  })
})
