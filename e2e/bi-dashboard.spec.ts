import { test, expect } from '@playwright/test';
test.describe('BI Dashboard', () => {
  test('loads page', async ({ page }) => { await page.goto('/bi'); await expect(page.locator('main')).toBeVisible(); });
});
