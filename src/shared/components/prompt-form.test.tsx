import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PromptForm } from '@/shared/components/prompt-form'

describe('PromptForm', () => {
  it('should submit new prompt data successfully', async () => {
    const handleSave = vi.fn().mockResolvedValue(undefined)
    const handleCancel = vi.fn()
    render(<PromptForm onSave={handleSave} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^name$/i), 'new-prompt')
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

  it('should show inline error for invalid kebab-case name', async () => {
    render(<PromptForm onSave={vi.fn()} onCancel={vi.fn()} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^name$/i), 'My Prompt!')

    expect(
      screen.getByText(/use lowercase letters, numbers, and hyphens/i),
    ).toBeInTheDocument()
  })

  it('should clear error when name becomes valid', async () => {
    render(<PromptForm onSave={vi.fn()} onCancel={vi.fn()} />)
    const user = userEvent.setup()
    const input = screen.getByLabelText(/^name$/i)

    await user.type(input, 'Bad Name')
    expect(
      screen.getByText(/use lowercase letters, numbers, and hyphens/i),
    ).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'good-name')
    expect(
      screen.queryByText(/use lowercase letters, numbers, and hyphens/i),
    ).not.toBeInTheDocument()
  })

  it('should disable save button when name is invalid', async () => {
    render(<PromptForm onSave={vi.fn()} onCancel={vi.fn()} />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^name$/i), 'Invalid Name')

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })
})
