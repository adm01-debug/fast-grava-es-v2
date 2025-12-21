import { test, expect } from '@playwright/test';
test.describe('Pending Queue', () => {
  test('loads page', async ({ page }) => { await page.goto('/pending'); await expect(page.locator('main')).toBeVisible(); });
});
