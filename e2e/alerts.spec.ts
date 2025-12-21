import { test, expect } from '@playwright/test';
test.describe('Alerts', () => {
  test('loads page', async ({ page }) => { await page.goto('/alerts'); await expect(page.locator('main')).toBeVisible(); });
});
