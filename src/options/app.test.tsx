import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from '@/options/app'
import { TooltipProvider } from '@/shared/components/ui/tooltip'

const mockUpdateSettings = vi.fn()
const mockUpdateSiteSettings = vi.fn()
const mockImportPrompts = vi.fn()

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
    updateSettings: mockUpdateSettings,
    updateSiteSettings: mockUpdateSiteSettings,
  }),
}))

vi.mock('@/shared/hooks/use-prompts', () => ({
  usePrompts: () => ({
    prompts: [],
    isLoading: false,
    importPrompts: mockImportPrompts,
  }),
}))

describe('OptionsApp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateSettings.mockResolvedValue(undefined)
    mockUpdateSiteSettings.mockResolvedValue(undefined)
  })

  it('should render default sites with loaded settings', () => {
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )

    expect(screen.getByText('claude.ai')).toBeInTheDocument()
    expect(
      screen.getByRole('textbox', { name: /trigger symbol for claude\.ai/i }),
    ).toHaveValue('/')

    expect(
      screen.getByRole('textbox', { name: /trigger symbol for chatgpt\.com/i }),
    ).toHaveValue('>')
  })

  function getSiteConfigSection() {
    const heading = screen.getByRole('heading', {
      name: /per-site configuration/i,
    })
    const section = heading.closest('div')?.parentElement
    if (!section) throw new Error('Site config section container not found')
    return within(section)
  }

  it('should show "Settings saved" feedback after a successful save', async () => {
    mockUpdateSiteSettings.mockResolvedValue(undefined)
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )
    const user = userEvent.setup()

    const claudeInput = screen.getByRole('textbox', {
      name: /trigger symbol for claude\.ai/i,
    })
    await user.clear(claudeInput)
    await user.type(claudeInput, '!')

    const section = getSiteConfigSection()
    await user.click(section.getByRole('button', { name: /^save$/i }))

    await waitFor(() => {
      expect(section.getByText(/^saved/i)).toBeVisible()
    })
  })

  it('should show slash conflict warning immediately on load for claude.ai', () => {
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )

    expect(
      screen.getByText("/ conflicts with this site's native slash menu"),
    ).toBeInTheDocument()
  })

  it('should show slash conflict warning immediately when chatgpt.com trigger is set to /', async () => {
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )
    const user = userEvent.setup()

    const chatgptInput = screen.getByRole('textbox', {
      name: /trigger symbol for chatgpt\.com/i,
    })
    await user.clear(chatgptInput)
    await user.type(chatgptInput, '/')

    expect(
      screen.getAllByText("/ conflicts with this site's native slash menu"),
    ).toHaveLength(2)
  })

  it('should not show slash conflict warning for gemini.google.com with /', async () => {
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )
    const user = userEvent.setup()

    const geminiInput = screen.getByRole('textbox', {
      name: /trigger symbol for gemini\.google\.com/i,
    })
    await user.clear(geminiInput)
    await user.type(geminiInput, '/')

    // Only claude.ai (loaded with /) should show a warning, not gemini
    expect(
      screen.getAllByText("/ conflicts with this site's native slash menu"),
    ).toHaveLength(1)
  })

  it('should allow saving with / despite the conflict warning', async () => {
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )
    const user = userEvent.setup()

    const chatgptInput = screen.getByRole('textbox', {
      name: /trigger symbol for chatgpt\.com/i,
    })
    await user.clear(chatgptInput)
    await user.type(chatgptInput, '/')
    await user.tab()

    const saveButton = getSiteConfigSection().getByRole('button', {
      name: /^save$/i,
    })
    expect(saveButton).not.toBeDisabled()
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateSiteSettings).toHaveBeenCalledWith('chatgpt.com', {
        triggerSymbol: '/',
        enabled: true,
      })
    })
  })

  it('should only call updateSiteSettings for modified sites on save', async () => {
    render(
      <TooltipProvider>
        <App />
      </TooltipProvider>,
    )
    const user = userEvent.setup()

    const claudeInput = screen.getByRole('textbox', {
      name: /trigger symbol for claude\.ai/i,
    })
    await user.clear(claudeInput)
    await user.type(claudeInput, '!')

    const claudeCheckbox = screen.getByRole('checkbox', {
      name: /enable caret on claude\.ai/i,
    })
    await user.click(claudeCheckbox)

    const saveButton = getSiteConfigSection().getByRole('button', {
      name: /^save$/i,
    })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateSiteSettings).toHaveBeenCalledTimes(1)
      expect(mockUpdateSiteSettings).toHaveBeenCalledWith('claude.ai', {
        triggerSymbol: '!',
        enabled: false,
      })
    })
  })
})
