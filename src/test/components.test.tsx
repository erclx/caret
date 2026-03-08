import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PromptForm } from '@/shared/components/prompt-form'
import { PromptList } from '@/shared/components/prompt-list'
import type { Prompt } from '@/shared/types'

const mockPrompts: Prompt[] = [
  { id: '1', name: 'prompt-1', body: 'Body 1', createdAt: 0, updatedAt: 0 },
  { id: '2', name: 'prompt-2', body: 'Body 2', createdAt: 0, updatedAt: 0 },
]

describe('PromptForm', () => {
  it('should submit new prompt data successfully', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined)
    const handleCancel = vi.fn()
    render(<PromptForm onSave={handleSave} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/trigger name/i), 'new-prompt')
    await user.type(screen.getByLabelText(/prompt body/i), 'New body')
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(handleSave).toHaveBeenCalledWith({
      name: 'new-prompt',
      body: 'New body',
    })
  })

  it('should call onCancel when the cancel button is clicked', async () => {
    const handleSave = vi.fn()
    const handleCancel = vi.fn()
    render(<PromptForm onSave={handleSave} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(handleCancel).toHaveBeenCalled()
    expect(handleSave).not.toHaveBeenCalled()
  })
})

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
