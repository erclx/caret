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
    body: 'Summarize the following text into 3 concise bullet points.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'seed-2',
    name: 'refactor',
    body: 'Refactor the following code to improve readability and maintainability without altering its behavior.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'seed-3',
    name: 'explain',
    body: 'Explain this concept using simple terms as if talking to a high school student.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]

type ColorScheme = 'light' | 'dark'
type Surface = 'popup' | 'sidepanel'

type BrowserGlobal = {
  chrome: {
    storage: {
      local: {
        set: (data: Record<string, unknown>) => void
      }
    }
  }
}

const SURFACES: Record<Surface, { width: number; height: number }> = {
  popup: { width: 320, height: 500 },
  sidepanel: { width: 400, height: 800 },
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

async function goto(
  page: Page,
  extensionId: string,
  surface: Surface,
  scheme: ColorScheme,
) {
  const { width, height } = SURFACES[surface]
  await page.setViewportSize({ width, height })
  await page.emulateMedia({ colorScheme: scheme })
  await page.goto(`chrome-extension://${extensionId}/src/${surface}/index.html`)
  await page.waitForLoadState('networkidle')
}

async function shot(page: Page, filename: string) {
  await page.screenshot({ path: path.join(screenshotsDir, filename) })
  console.log(`✓ ${filename}`)
}

// popup and sidepanel
for (const scheme of ['light', 'dark'] as ColorScheme[]) {
  for (const surface of ['popup', 'sidepanel'] as Surface[]) {
    // fresh context per surface so storage state doesn't bleed between empty and seeded shots
    const emptyCtx = await launchWithExtension()
    const emptyId = await getExtensionId(emptyCtx)
    const emptyPage = await emptyCtx.newPage()
    await goto(emptyPage, emptyId, surface, scheme)
    await shot(emptyPage, `${surface}-${scheme}-empty.png`)
    await emptyCtx.close()

    const ctx = await launchWithExtension()
    // addInitScript: runs before any page script so storage is populated before react mounts
    await ctx.addInitScript((prompts: Record<string, unknown>[]) => {
      ;(globalThis as unknown as BrowserGlobal).chrome.storage.local.set({
        prompts,
      })
    }, SEED_PROMPTS)
    const id = await getExtensionId(ctx)

    const listPage = await ctx.newPage()
    await goto(listPage, id, surface, scheme)
    await shot(listPage, `${surface}-${scheme}-list.png`)

    await listPage.getByRole('button', { name: /new/i }).click()
    await listPage.waitForTimeout(200)
    await shot(listPage, `${surface}-${scheme}-form-new.png`)

    await listPage.getByRole('button', { name: /cancel/i }).click()
    await listPage.waitForTimeout(200)
    await listPage
      .getByRole('button', { name: /edit prompt/i })
      .first()
      .click()
    await listPage.waitForTimeout(200)
    await shot(listPage, `${surface}-${scheme}-form-edit.png`)

    await ctx.close()
  }
}

// options page
for (const scheme of ['light', 'dark'] as ColorScheme[]) {
  const ctx = await launchWithExtension()
  const id = await getExtensionId(ctx)

  const page = await ctx.newPage()
  // options is a full tab, not a constrained popup — use a normal viewport
  await page.setViewportSize({ width: 800, height: 600 })
  await page.emulateMedia({ colorScheme: scheme })
  await page.goto(`chrome-extension://${id}/src/options/index.html`)
  await page.waitForLoadState('networkidle')
  await shot(page, `options-${scheme}-default.png`)

  // capture disabled state so the trigger input appears dimmed in the record
  await page
    .getByRole('checkbox', { name: /enable caret on claude\.ai/i })
    .click()
  await page.waitForTimeout(100)
  await shot(page, `options-${scheme}-site-disabled.png`)

  await ctx.close()
}

console.log(`\nAll screenshots saved to: screenshots/`)
