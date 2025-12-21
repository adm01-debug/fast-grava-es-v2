import { test, expect } from '@playwright/test';
test.describe('Home', () => {
  test('loads page', async ({ page }) => { await page.goto('/'); await expect(page.locator('main')).toBeVisible(); });
});
