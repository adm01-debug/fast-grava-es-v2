import { test, expect } from '@playwright/test';
test.describe('Technical Assistant', () => {
  test('loads page', async ({ page }) => { await page.goto('/technical-assistant'); await expect(page.locator('main')).toBeVisible(); });
});
