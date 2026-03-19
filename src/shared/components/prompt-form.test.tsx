import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { PromptForm } from '@/shared/components/prompt-form'
import type { Prompt } from '@/shared/types'

const EXISTING_PROMPT: Prompt = {
  id: '1',
  name: 'my-prompt',
  body: 'Existing body.',
  createdAt: 0,
  updatedAt: 0,
}

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

  it('should call onCancel immediately when form is clean', async () => {
    const handleCancel = vi.fn()
    render(<PromptForm onSave={vi.fn()} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(handleCancel).toHaveBeenCalled()
    expect(screen.queryByText(/discard changes/i)).not.toBeInTheDocument()
  })

  it('should call onCancel immediately when Back is clicked on clean form', async () => {
    const handleCancel = vi.fn()
    render(<PromptForm onSave={vi.fn()} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.click(screen.getByText(/← back/i))

    expect(handleCancel).toHaveBeenCalled()
  })

  it('should show discard confirmation at bottom when Cancel is clicked on dirty form', async () => {
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/prompt body/i), ' extra')
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByText(/discard changes/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /keep editing/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^cancel$/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^save$/i }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/← back/i)).toBeInTheDocument()
  })

  it('should show discard confirmation at top when Back is clicked on dirty form', async () => {
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/prompt body/i), ' extra')
    await user.click(screen.getByText(/← back/i))

    expect(screen.getByText(/discard changes/i)).toBeInTheDocument()
    expect(screen.queryByText(/← back/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /^cancel$/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument()
  })

  it('should dismiss confirmation and return to editing when Keep editing is clicked', async () => {
    const handleCancel = vi.fn()
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        onSave={vi.fn()}
        onCancel={handleCancel}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/prompt body/i), ' extra')
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    await user.click(screen.getByRole('button', { name: /keep editing/i }))

    expect(handleCancel).not.toHaveBeenCalled()
    expect(screen.queryByText(/discard changes/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('should call onCancel when Discard is clicked', async () => {
    const handleCancel = vi.fn()
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        onSave={vi.fn()}
        onCancel={handleCancel}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/prompt body/i), ' extra')
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    await user.click(screen.getByRole('button', { name: /discard/i }))

    expect(handleCancel).toHaveBeenCalled()
  })

  it('should call onCancel immediately when Esc is pressed on a clean form', async () => {
    const handleCancel = vi.fn()
    render(<PromptForm onSave={vi.fn()} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.click(screen.getByLabelText(/prompt body/i))
    await user.keyboard('{Escape}')

    expect(handleCancel).toHaveBeenCalled()
    expect(screen.queryByText(/discard changes/i)).not.toBeInTheDocument()
  })

  it('should show discard confirmation when Esc is pressed on a dirty form', async () => {
    const handleCancel = vi.fn()
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        onSave={vi.fn()}
        onCancel={handleCancel}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/prompt body/i), ' extra')
    await user.keyboard('{Escape}')

    expect(handleCancel).not.toHaveBeenCalled()
    expect(screen.getByText(/discard changes/i)).toBeInTheDocument()
  })

  it('should dismiss discard confirmation when Esc is pressed a second time', async () => {
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/prompt body/i), ' extra')
    await user.keyboard('{Escape}')
    expect(screen.getByText(/discard changes/i)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByText(/discard changes/i)).not.toBeInTheDocument()
  })

  it('should not warn when new form has empty fields', async () => {
    const handleCancel = vi.fn()
    render(<PromptForm onSave={vi.fn()} onCancel={handleCancel} />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(handleCancel).toHaveBeenCalled()
    expect(screen.queryByText(/discard changes/i)).not.toBeInTheDocument()
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

  it('should show duplicate name error when name matches an existing prompt', async () => {
    render(
      <PromptForm
        existingNames={['existing-prompt']}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^name$/i), 'existing-prompt')

    expect(
      screen.getByText(/a prompt with this name already exists/i),
    ).toBeInTheDocument()
  })

  it('should disable save button when name is a duplicate', async () => {
    render(
      <PromptForm
        existingNames={['existing-prompt']}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/^name$/i), 'existing-prompt')

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
  })

  it('should not show duplicate error when editing a prompt with its own name', async () => {
    render(
      <PromptForm
        initialPrompt={EXISTING_PROMPT}
        existingNames={[EXISTING_PROMPT.name]}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    const input = screen.getByLabelText(/^name$/i)

    await user.clear(input)
    await user.type(input, EXISTING_PROMPT.name)

    expect(
      screen.queryByText(/a prompt with this name already exists/i),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled()
  })

  it('should clear duplicate error when name is changed to a non-duplicate', async () => {
    render(
      <PromptForm
        existingNames={['existing-prompt']}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    const input = screen.getByLabelText(/^name$/i)

    await user.type(input, 'existing-prompt')
    expect(
      screen.getByText(/a prompt with this name already exists/i),
    ).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'new-prompt')
    expect(
      screen.queryByText(/a prompt with this name already exists/i),
    ).not.toBeInTheDocument()
  })
})
