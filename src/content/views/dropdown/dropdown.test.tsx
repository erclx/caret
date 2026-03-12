import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Dropdown } from './dropdown'

beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('Dropdown', () => {
  const prompts = [
    {
      id: '1',
      name: 'summarize',
      body: 'Sum this',
      createdAt: 0,
      updatedAt: 0,
    },
    { id: '2', name: 'refactor', body: 'Fix this', createdAt: 0, updatedAt: 0 },
    {
      id: '3',
      name: 'explain',
      body: 'Explain this',
      createdAt: 0,
      updatedAt: 0,
    },
  ]

  it('should filter prompts by query', () => {
    render(
      <Dropdown
        prompts={prompts}
        query='sum'
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('summarize')).toBeInTheDocument()
    expect(screen.queryByText('refactor')).not.toBeInTheDocument()
  })

  it('should navigate down and select via keyboard', async () => {
    const handleSelect = vi.fn()
    render(
      <Dropdown
        prompts={prompts}
        query=''
        onSelect={handleSelect}
        onClose={vi.fn()}
      />,
    )

    const user = userEvent.setup()
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(handleSelect).toHaveBeenCalledWith(prompts[1])
  })

  it('should wrap from last item to first on ArrowDown', async () => {
    const handleSelect = vi.fn()
    render(
      <Dropdown
        prompts={prompts}
        query=''
        onSelect={handleSelect}
        onClose={vi.fn()}
      />,
    )

    const user = userEvent.setup()
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')

    expect(handleSelect).toHaveBeenCalledWith(prompts[0])
  })

  it('should wrap from first item to last on ArrowUp', async () => {
    const handleSelect = vi.fn()
    render(
      <Dropdown
        prompts={prompts}
        query=''
        onSelect={handleSelect}
        onClose={vi.fn()}
      />,
    )

    const user = userEvent.setup()
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{Enter}')

    expect(handleSelect).toHaveBeenCalledWith(prompts[2])
  })

  it('should call onClose on Escape', async () => {
    const handleClose = vi.fn()
    render(
      <Dropdown
        prompts={prompts}
        query=''
        onSelect={vi.fn()}
        onClose={handleClose}
      />,
    )

    await userEvent.setup().keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalled()
  })
})
