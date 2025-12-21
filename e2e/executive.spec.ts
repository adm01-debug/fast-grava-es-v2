import { test, expect } from '@playwright/test';
test.describe('Executive', () => {
  test('loads page', async ({ page }) => { await page.goto('/executive'); await expect(page.locator('main')).toBeVisible(); });
});
