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
  it('should render empty state when no prompts exist', () => {
    render(
      <PromptList
        prompts={[]}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText(/no prompts found/i)).toBeInTheDocument()
  })

  it('should require inline confirmation before triggering delete', async () => {
    const handleDelete = vi.fn()
    render(
      <PromptList
        prompts={mockPrompts}
        onCreate={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />,
    )
    const user = userEvent.setup()

    const deleteButtons = screen.getAllByRole('button', {
      name: /delete prompt/i,
    })
    await user.click(deleteButtons[0])

    expect(handleDelete).not.toHaveBeenCalled()

    const confirmButton = screen.getByRole('button', {
      name: /confirm delete/i,
    })
    await user.click(confirmButton)

    expect(handleDelete).toHaveBeenCalledWith('1')
  })
})
