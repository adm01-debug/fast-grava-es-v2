import { test, expect } from '@playwright/test';
test.describe('ML Predictions', () => {
  test('loads page', async ({ page }) => { await page.goto('/ml-predictions'); await expect(page.locator('main')).toBeVisible(); });
});
