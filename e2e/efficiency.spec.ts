import { test, expect } from '@playwright/test';
test.describe('Efficiency', () => {
  test('loads page', async ({ page }) => { await page.goto('/efficiency'); await expect(page.locator('main')).toBeVisible(); });
});
