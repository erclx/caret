import { type BrowserContext, chromium, type Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(__dirname, '..', 'screenshots')
fs.mkdirSync(screenshotsDir, { recursive: true })

const pathToExtension = path.join(__dirname, '..', 'dist')

const SEED_PROMPTS = [
  {
    id: 'seed-1',
    name: 'summarize',
    label: 'claude',
    body: 'Summarize the following text into 3 concise bullet points.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'seed-2',
    name: 'refactor',
    label: 'claude',
    body: 'Refactor the following code to improve readability and maintainability without altering its behavior.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'seed-3',
    name: 'draft-email',
    label: 'writing',
    body: 'Draft a professional email based on the following notes:',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'seed-4',
    name: 'proofread',
    body: 'Proofread this. Fix grammar, spelling, and clarity.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'seed-5',
    name: 'review-pr',
    label: 'claude',
    source: 'github',
    body: 'Review this pull request focusing on security and performance constraints.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

const MOCK_CHATGPT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        margin: 0;
        padding: 20px;
        display: flex;
        align-items: flex-end;
        height: 100vh;
        box-sizing: border-box;
        background: #fff;
      }
      @media (prefers-color-scheme: dark) {
        body { background: #212121; }
      }
      textarea {
        width: 100%;
        padding: 12px;
        font-size: 14px;
        border-radius: 4px;
        border: 1px solid #e4e4e7;
        background: #fff;
        color: #000;
      }
      @media (prefers-color-scheme: dark) {
        textarea { background: #2f2f2f; border-color: #4a4a4a; color: #ececec; }
      }
    </style>
  </head>
  <body>
    <textarea id="prompt-textarea" placeholder="Message ChatGPT"></textarea>
  </body>
</html>`

type ColorScheme = 'light' | 'dark'

type BrowserGlobal = {
  chrome: {
    storage: {
      local: {
        set: (data: Record<string, unknown>) => void
      }
    }
  }
}

async function launchWithExtension(): Promise<BrowserContext> {
  return chromium.launchPersistentContext('', {
    channel: 'chromium',
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  })
}

async function getExtensionId(ctx: BrowserContext): Promise<string> {
  let [sw] = ctx.serviceWorkers()
  if (!sw) sw = await ctx.waitForEvent('serviceworker')
  return sw.url().split('/')[2]
}

async function shot(
  page: Page,
  surface: string,
  filename: string,
  fullPage = false,
) {
  const dir = path.join(screenshotsDir, surface)
  fs.mkdirSync(dir, { recursive: true })
  await page.screenshot({ path: path.join(dir, filename), fullPage })
  console.log(`✓ ${surface}/${filename}`)
}

// sidepanel

for (const scheme of ['light', 'dark'] as ColorScheme[]) {
  const emptyCtx = await launchWithExtension()
  const emptyId = await getExtensionId(emptyCtx)
  const emptyPage = await emptyCtx.newPage()
  await emptyPage.setViewportSize({ width: 400, height: 800 })
  await emptyPage.emulateMedia({ colorScheme: scheme })
  await emptyPage.goto(`chrome-extension://${emptyId}/src/sidepanel/index.html`)
  await emptyPage.waitForLoadState('networkidle')
  await shot(emptyPage, 'sidepanel', `${scheme}-empty.png`)
  await emptyCtx.close()

  const ctx = await launchWithExtension()
  await ctx.addInitScript((prompts: Record<string, unknown>[]) => {
    ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
      prompts,
    })
  }, SEED_PROMPTS)
  const id = await getExtensionId(ctx)

  const listPage = await ctx.newPage()
  await listPage.setViewportSize({ width: 400, height: 800 })
  await listPage.emulateMedia({ colorScheme: scheme })
  await listPage.goto(`chrome-extension://${id}/src/sidepanel/index.html`)
  await listPage.waitForLoadState('networkidle')
  await shot(listPage, 'sidepanel', `${scheme}-list.png`)

  await listPage.getByRole('button', { name: /label/i }).click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-list-label-popover.png`)
  await listPage.getByRole('checkbox', { name: /claude/i }).click()
  await listPage.waitForTimeout(200)
  await listPage.keyboard.press('Escape')
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-list-filtered.png`)

  await listPage
    .getByRole('button', { name: /delete prompt/i })
    .first()
    .click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-list-delete.png`)
  await listPage.getByRole('button', { name: /cancel/i }).click()
  await listPage.waitForTimeout(200)

  await listPage.getByPlaceholder('Search prompts...').fill('xyz123')
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-list-empty-search.png`)
  await listPage.getByPlaceholder('Search prompts...').fill('')
  await listPage.waitForTimeout(200)

  await listPage.getByRole('button', { name: /new/i }).click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-form-new.png`)

  await listPage.getByRole('button', { name: /cancel/i }).click()
  await listPage.waitForTimeout(200)
  await listPage.getByText(SEED_PROMPTS[0].name).first().click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-form-edit.png`)

  await listPage.getByRole('button', { name: /cancel/i }).click()
  await listPage.waitForTimeout(200)
  await listPage.getByText('review-pr').first().click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-form-edit-github.png`)

  await listPage.getByLabel(/prompt body/i).type(' updated')
  await listPage.getByRole('button', { name: /cancel/i }).click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-form-dirty.png`)

  await listPage.getByRole('button', { name: /discard/i }).click()
  await listPage.waitForTimeout(200)

  await listPage.getByText(/^GitHub$/).click()
  await listPage.waitForTimeout(200)
  await shot(listPage, 'sidepanel', `${scheme}-github-not-configured.png`)

  await listPage.evaluate(() => {
    ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
      prompts: [],
    })
  })
  await listPage.getByRole('button', { name: /Prompts/i }).click()
  await listPage.waitForTimeout(500)
  await shot(listPage, 'sidepanel', `${scheme}-list-empty-all-deleted.png`)

  await ctx.close()

  const ghCtx = await launchWithExtension()
  await ghCtx.addInitScript((seeds) => {
    ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
      prompts: seeds,
      settings: {
        github: {
          pat: 'ghp_fake123',
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          snippetsPath: 'snippets',
        },
      },
    })
  }, SEED_PROMPTS)
  const ghId = await getExtensionId(ghCtx)
  const ghPage = await ghCtx.newPage()
  await ghPage.setViewportSize({ width: 400, height: 800 })
  await ghPage.emulateMedia({ colorScheme: scheme })

  await ghPage.route(
    'https://api.github.com/repos/owner/repo/contents/snippets?ref=main',
    async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            name: 'new-prompt.md',
            type: 'file',
            download_url: 'https://fake/new-prompt.md',
          },
        ],
      })
    },
  )
  await ghPage.route('https://fake/new-prompt.md', async (route) => {
    await route.fulfill({ status: 200, body: 'This is a new prompt' })
  })

  await ghPage.goto(`chrome-extension://${ghId}/src/sidepanel/index.html`)
  await ghPage.getByRole('button', { name: /GitHub/i }).click()
  await ghPage.waitForTimeout(200)
  await shot(ghPage, 'sidepanel', `${scheme}-github-never-synced.png`)

  await ghPage.getByRole('button', { name: /Sync now/i }).click()
  await ghPage.waitForTimeout(1000)
  await shot(ghPage, 'sidepanel', `${scheme}-github-diff.png`)
  await ghCtx.close()
}

// options

for (const scheme of ['light', 'dark'] as ColorScheme[]) {
  const ctx = await launchWithExtension()
  const id = await getExtensionId(ctx)

  const page = await ctx.newPage()
  await page.setViewportSize({ width: 800, height: 900 })
  await page.emulateMedia({ colorScheme: scheme })
  await page.goto(`chrome-extension://${id}/src/options/index.html`)
  await page.waitForLoadState('networkidle')
  await shot(page, 'options', `${scheme}.png`, true)

  const errorCtx = await launchWithExtension()
  const errorId = await getExtensionId(errorCtx)
  const errorPage = await errorCtx.newPage()
  await errorPage.setViewportSize({ width: 800, height: 900 })
  await errorPage.emulateMedia({ colorScheme: scheme })

  await errorPage.goto(`chrome-extension://${errorId}/src/options/index.html`)
  await errorPage.evaluate(() => {
    ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
      settings: {
        sites: {
          'claude.ai': { triggerSymbol: '/', enabled: true },
          'chatgpt.com': { triggerSymbol: 'ab', enabled: true },
        },
        github: {
          pat: 'bad_token',
          owner: 'owner',
          repo: 'repo',
          branch: 'main',
          snippetsPath: 'snippets',
          connectionHealth: 'error',
        },
      },
    })
  })

  await errorPage.reload({ waitUntil: 'networkidle' })
  await shot(errorPage, 'options', `${scheme}-errors.png`, true)

  await errorCtx.close()
  await ctx.close()
}

// dropdown

for (const scheme of ['light', 'dark'] as ColorScheme[]) {
  const ctx = await launchWithExtension()
  const id = await getExtensionId(ctx)

  const seedPage = await ctx.newPage()
  await seedPage.goto(`chrome-extension://${id}/src/sidepanel/index.html`)
  await seedPage.evaluate((prompts) => {
    ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
      prompts,
      settings: {
        sites: { 'chatgpt.com': { triggerSymbol: '>', enabled: true } },
      },
    })
  }, SEED_PROMPTS)
  await seedPage.close()

  const page = await ctx.newPage()
  await page.setViewportSize({ width: 800, height: 600 })
  await page.emulateMedia({ colorScheme: scheme })
  await page.route('https://chatgpt.com/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: MOCK_CHATGPT_HTML,
    })
  })
  await page.goto('https://chatgpt.com/')
  const textarea = page.locator('#prompt-textarea')
  await textarea.waitFor()
  await page.locator('#crxjs-app').waitFor({ state: 'attached' })
  await page.waitForTimeout(500)
  await textarea.focus()
  await page.keyboard.type('>')
  await page.waitForTimeout(500)
  await shot(page, 'dropdown', `${scheme}.png`)

  await textarea.blur()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await textarea.focus()
  await page.keyboard.press('Backspace')
  await page.keyboard.type('>nonsense')
  await page.waitForTimeout(500)
  await shot(page, 'dropdown', `${scheme}-no-results.png`)

  await ctx.close()

  const emptyDlCtx = await launchWithExtension()
  const emptyDlId = await getExtensionId(emptyDlCtx)
  const emptyDlPage = await emptyDlCtx.newPage()
  await emptyDlPage.setViewportSize({ width: 800, height: 600 })
  await emptyDlPage.emulateMedia({ colorScheme: scheme })

  await emptyDlPage.route('https://chatgpt.com/*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: MOCK_CHATGPT_HTML,
    })
  })

  const setupPage = await emptyDlCtx.newPage()
  await setupPage.goto(
    `chrome-extension://${emptyDlId}/src/sidepanel/index.html`,
  )
  await setupPage.evaluate(() => {
    ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
      settings: {
        sites: { 'chatgpt.com': { triggerSymbol: '>', enabled: true } },
      },
    })
  })
  await setupPage.close()

  await emptyDlPage.goto('https://chatgpt.com/')
  const emptyDlTextarea = emptyDlPage.locator('#prompt-textarea')
  await emptyDlTextarea.waitFor()
  await emptyDlPage.locator('#crxjs-app').waitFor({ state: 'attached' })
  await emptyDlPage.waitForTimeout(500)

  await emptyDlTextarea.focus()
  await emptyDlPage.keyboard.type('>')
  await emptyDlPage.waitForTimeout(500)
  await shot(emptyDlPage, 'dropdown', `${scheme}-empty.png`)
  await emptyDlCtx.close()
}

console.log(`\nAll screenshots saved to: screenshots/`)
