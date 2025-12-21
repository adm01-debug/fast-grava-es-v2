import { test, expect } from '@playwright/test';
test.describe('PWA Install', () => {
  test('loads page', async ({ page }) => { await page.goto('/install'); await expect(page.locator('main')).toBeVisible(); });
});
