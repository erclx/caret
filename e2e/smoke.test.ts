import { expect, test } from './fixtures'

test.describe('Extension UI Smoke Test', () => {
  test('Popup should load and render prompt library', async ({
    page,
    extensionId,
  }) => {
    await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`)
    await expect(page.getByText('No prompts found.')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /create prompt/i }),
    ).toBeVisible()
  })

  test('Sidepanel should load and render prompt library', async ({
    page,
    extensionId,
  }) => {
    await page.goto(
      `chrome-extension://${extensionId}/src/sidepanel/index.html`,
    )
    await expect(page.getByText('No prompts found.')).toBeVisible()
    await expect(
      page.getByRole('button', { name: /create prompt/i }),
    ).toBeVisible()
  })
})
