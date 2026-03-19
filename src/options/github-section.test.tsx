import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GithubSection } from '@/options/github-section'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import type { Settings } from '@/shared/types'

const { mockTestConnection, mockGetSettings } = vi.hoisted(() => ({
  mockTestConnection: vi.fn(),
  mockGetSettings: vi.fn(),
}))

vi.mock('@/shared/utils/github', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/utils/github')>()
  return { ...actual, testConnection: mockTestConnection }
})

vi.mock('@/shared/utils/storage', () => ({
  storage: { getSettings: mockGetSettings },
}))

const BASE_CONFIG = {
  pat: 'ghp_test',
  owner: 'testuser',
  repo: 'snippets',
  branch: 'main',
  snippetsPath: 'snippets',
}

function makeSettings(overrides: Partial<Settings> = {}): Settings {
  return { sites: {}, ...overrides }
}

function renderSection(
  settings: Settings,
  updateSettings = vi.fn().mockResolvedValue(undefined),
) {
  const user = userEvent.setup()
  render(
    <TooltipProvider>
      <GithubSection settings={settings} updateSettings={updateSettings} />
    </TooltipProvider>,
  )
  return { user, updateSettings }
}

describe('GithubSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetSettings.mockResolvedValue(makeSettings({ github: BASE_CONFIG }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('connection status indicator', () => {
    it('should show "Connected" when connectionHealth is connected', () => {
      renderSection(
        makeSettings({
          github: { ...BASE_CONFIG, connectionHealth: 'connected' },
        }),
      )

      expect(screen.getByText('Connected')).toBeInTheDocument()
    })

    it('should show "Error" when connectionHealth is error', () => {
      renderSection(
        makeSettings({
          github: { ...BASE_CONFIG, connectionHealth: 'error' },
        }),
      )

      expect(screen.getByText('Error')).toBeInTheDocument()
    })

    it('should show "Not configured" when no github config', () => {
      renderSection(makeSettings())

      expect(screen.getByText('Not configured')).toBeInTheDocument()
    })
  })

  describe('save', () => {
    it('should call updateSettings with connection fields on successful save', async () => {
      mockTestConnection.mockResolvedValue({ ok: true })
      const { user, updateSettings } = renderSection(makeSettings())

      await user.type(
        screen.getByLabelText(/personal access token/i),
        'ghp_abc',
      )
      await user.clear(screen.getByPlaceholderText('owner/repo'))
      await user.type(
        screen.getByPlaceholderText('owner/repo'),
        'octocat/my-snippets',
      )
      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(updateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            github: expect.objectContaining({
              owner: 'octocat',
              repo: 'my-snippets',
              connectionHealth: 'connected',
            }),
          }),
        )
      })
    })

    it('should show "Saved ✓" feedback after a successful save', async () => {
      mockTestConnection.mockResolvedValue({ ok: true })
      const { user } = renderSection(
        makeSettings({
          github: { ...BASE_CONFIG, connectionHealth: 'connected' },
        }),
      )

      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(screen.getByText('Saved ✓')).toHaveClass('opacity-100')
      })
    })

    it('should show a connection error message when save fails', async () => {
      mockTestConnection.mockResolvedValue({
        ok: false,
        error: 'Check that your token has repo read access.',
      })
      const { user } = renderSection(makeSettings())

      await user.type(
        screen.getByLabelText(/personal access token/i),
        'ghp_bad',
      )
      await user.clear(screen.getByPlaceholderText('owner/repo'))
      await user.type(
        screen.getByPlaceholderText('owner/repo'),
        'octocat/snippets',
      )
      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Check that your token has repo read access.'),
        ).toBeInTheDocument()
      })
    })

    it('should show "Error" status indicator after a failed save', async () => {
      mockTestConnection.mockResolvedValue({
        ok: false,
        error: 'Check the repository, branch, and snippets path.',
      })
      const { user } = renderSection(makeSettings())

      await user.type(
        screen.getByLabelText(/personal access token/i),
        'ghp_bad',
      )
      await user.clear(screen.getByPlaceholderText('owner/repo'))
      await user.type(
        screen.getByPlaceholderText('owner/repo'),
        'octocat/snippets',
      )
      await user.click(screen.getByRole('button', { name: /^save$/i }))

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
      })
    })

    it('should disable the save button when there is a repo validation error', async () => {
      const { user } = renderSection(makeSettings())

      await user.type(
        screen.getByPlaceholderText('owner/repo'),
        'invalid-no-slash',
      )

      expect(screen.getByRole('button', { name: /^save$/i })).toBeDisabled()
    })
  })

  describe('disconnect', () => {
    it('should call updateSettings without the github key on disconnect', async () => {
      const settingsWithSites = makeSettings({
        github: { ...BASE_CONFIG, connectionHealth: 'connected' },
        sites: { 'claude.ai': { triggerSymbol: '>', enabled: true } },
      })
      mockGetSettings.mockResolvedValue(settingsWithSites)

      const { user, updateSettings } = renderSection(settingsWithSites)

      await user.click(screen.getByRole('button', { name: /disconnect/i }))

      await waitFor(() => {
        expect(updateSettings).toHaveBeenCalledWith(
          expect.not.objectContaining({ github: expect.anything() }),
        )
      })
    })

    it('should show "Not configured" after disconnect', async () => {
      const settings = makeSettings({
        github: { ...BASE_CONFIG, connectionHealth: 'connected' },
      })
      mockGetSettings.mockResolvedValue(settings)

      const { user } = renderSection(settings)

      await user.click(screen.getByRole('button', { name: /disconnect/i }))

      await waitFor(() => {
        expect(screen.getByText('Not configured')).toBeInTheDocument()
      })
    })

    it('should not render the disconnect button when no github config', () => {
      renderSection(makeSettings())

      expect(
        screen.queryByRole('button', { name: /disconnect/i }),
      ).not.toBeInTheDocument()
    })
  })
})
