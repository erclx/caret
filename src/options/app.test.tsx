import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import App from '@/options/app'

const mockUpdateSiteSettings = vi.fn()

vi.mock('@/shared/hooks/use-settings', () => ({
  useSettings: () => ({
    settings: {
      sites: {
        'claude.ai': { triggerSymbol: '/', enabled: true },
        'gemini.google.com': { triggerSymbol: '>', enabled: true },
        'chatgpt.com': { triggerSymbol: '>', enabled: true },
      },
    },
    isLoading: false,
    updateSiteSettings: mockUpdateSiteSettings,
  }),
}))

describe('OptionsApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render default sites with loaded settings', () => {
    render(<App />)

    expect(screen.getByText('claude.ai')).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /trigger symbol for claude\.ai/i }),
    ).toHaveValue('/')

    expect(
      screen.getByRole('textbox', { name: /trigger symbol for chatgpt\.com/i }),
    ).toHaveValue('>')
  })

  it('should only call updateSiteSettings for modified sites on save', async () => {
    render(<App />)
    const user = userEvent.setup()

    const claudeInput = screen.getByRole('textbox', {
      name: /trigger symbol for claude\.ai/i,
    })
    await user.clear(claudeInput)
    await user.type(claudeInput, '!!')

    const claudeCheckbox = screen.getByRole('checkbox', {
      name: /enable caret on claude\.ai/i,
    })
    await user.click(claudeCheckbox)

    const saveButton = screen.getByRole('button', { name: /save settings/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateSiteSettings).toHaveBeenCalledTimes(1)
      expect(mockUpdateSiteSettings).toHaveBeenCalledWith('claude.ai', {
        triggerSymbol: '!!',
        enabled: false,
      })
    })
  })
})
