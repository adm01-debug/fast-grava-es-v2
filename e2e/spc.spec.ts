import { test, expect } from '@playwright/test';
test.describe('SPC', () => {
  test('loads page', async ({ page }) => { await page.goto('/spc'); await expect(page.locator('main')).toBeVisible(); });
});
