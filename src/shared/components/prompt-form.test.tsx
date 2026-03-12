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
