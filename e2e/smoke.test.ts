import { expect, test } from '@playwright/test'

test.describe('Extension UI Smoke Test', () => {
  test('Popup should load and display title', async ({ page }) => {
    await page.goto('/src/popup/index.html')
    const heading = page.getByRole('heading', { name: /popup/i })
    await expect(heading).toBeVisible()
  })

  test('Sidepanel should load and display title', async ({ page }) => {
    await page.goto('/src/sidepanel/index.html')
    const heading = page.getByRole('heading', { name: /side panel/i })
    await expect(heading).toBeVisible()
  })
})
