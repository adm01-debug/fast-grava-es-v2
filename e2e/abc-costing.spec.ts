import { test, expect } from '@playwright/test';
test.describe('ABC Costing', () => {
  test('loads page', async ({ page }) => { await page.goto('/abc-costing'); await expect(page.locator('main')).toBeVisible(); });
});
