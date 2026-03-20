import { expect, test } from './fixtures'

type BrowserGlobal = {
  chrome: {
    storage: {
      local: { set: (data: Record<string, unknown>) => Promise<void> }
    }
  }
}

test.describe('Extension UI and Prompt Insertion E2E', () => {
  test('Sidepanel should load and render prompt library', async ({
    page,
    extensionId,
  }) => {
    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )
    await expect(page.getByText(/no prompts yet\./i)).toBeVisible()
    await expect(page.getByRole('button', { name: /new/i })).toBeVisible()
  })

  test('Esc on clean edit form should return to list', async ({
    page,
    extensionId,
  }) => {
    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )

    await page.evaluate(async () => {
      await (globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
        prompts: [
          {
            id: '1',
            name: 'my-prompt',
            body: 'Hello world.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
    })

    await page.reload()
    await page.getByText('my-prompt').click()
    await expect(page.getByLabel(/^name$/i)).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByText('my-prompt')).toBeVisible()
    await expect(page.getByLabel(/^name$/i)).not.toBeVisible()
  })

  test('Esc on dirty edit form should show discard confirmation', async ({
    page,
    extensionId,
  }) => {
    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )

    await page.evaluate(async () => {
      await (globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
        prompts: [
          {
            id: '1',
            name: 'my-prompt',
            body: 'Hello world.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      })
    })

    await page.reload()
    await page.getByText('my-prompt').click()
    await page.getByLabel(/prompt body/i).pressSequentially(' extra')

    await page.keyboard.press('Escape')

    await expect(page.getByText(/discard changes/i)).toBeVisible()
  })

  test('Should insert prompt into textarea (ChatGPT mock)', async ({
    page,
    extensionId,
  }) => {
    await page.route('https://chatgpt.com/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!DOCTYPE html><html><body><textarea id="prompt-textarea"></textarea></body></html>',
      })
    })

    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )

    await page.evaluate(async () => {
      await (globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
        prompts: [
          {
            id: '1',
            name: 'test-prompt',
            body: 'This is a test prompt body.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          sites: {
            'chatgpt.com': { triggerSymbol: '>', enabled: true },
          },
        },
      })
    })

    await page.goto('https://chatgpt.com/')

    const textarea = page.locator('#prompt-textarea')
    await textarea.waitFor()
    await textarea.focus()
    await textarea.pressSequentially('>test')

    const dropdown = page.locator('#crxjs-app').locator('text=test-prompt')
    await expect(dropdown).toBeVisible()

    await page.keyboard.press('Enter')

    await expect(textarea).toHaveValue('This is a test prompt body. ')
  })

  test('Should insert prompt into contenteditable (Gemini mock)', async ({
    page,
    extensionId,
  }) => {
    await page.route('https://gemini.google.com/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!DOCTYPE html><html><body><rich-textarea><div contenteditable="true"></div></rich-textarea></body></html>',
      })
    })

    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )

    await page.evaluate(async () => {
      await (globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
        prompts: [
          {
            id: '1',
            name: 'gemini-prompt',
            body: 'Gemini test body.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          sites: {
            'gemini.google.com': { triggerSymbol: '>', enabled: true },
          },
        },
      })
    })

    await page.goto('https://gemini.google.com/')

    const ce = page.locator('rich-textarea div[contenteditable="true"]')
    await ce.waitFor()
    await ce.focus()
    await ce.pressSequentially('>gemini')

    const dropdown = page.locator('#crxjs-app').locator('text=gemini-prompt')
    await expect(dropdown).toBeVisible()

    await page.keyboard.press('Enter')

    await expect(ce).toHaveText('Gemini test body.')
  })

  test('Should insert prompt into contenteditable (Claude mock)', async ({
    page,
    extensionId,
  }) => {
    await page.route('https://claude.ai/*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<!DOCTYPE html><html><body><div class="ProseMirror" contenteditable="true"></div></body></html>',
      })
    })

    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )

    await page.evaluate(async () => {
      await (globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
        prompts: [
          {
            id: '1',
            name: 'claude-prompt',
            body: 'Claude test body.',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        settings: {
          sites: {
            'claude.ai': { triggerSymbol: '/', enabled: true },
          },
        },
      })
    })

    await page.goto('https://claude.ai/chat')

    const ce = page.locator('.ProseMirror')
    await ce.waitFor()
    await ce.focus()
    await ce.pressSequentially('/claude')

    const dropdown = page.locator('#crxjs-app').locator('text=claude-prompt')
    await expect(dropdown).toBeVisible()

    await page.keyboard.press('Enter')

    await expect(ce).toHaveText('Claude test body.')
  })
})
