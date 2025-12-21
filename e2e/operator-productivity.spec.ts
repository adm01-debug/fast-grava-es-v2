import { test, expect } from '@playwright/test';
test.describe('Operator Productivity', () => {
  test('loads page', async ({ page }) => { await page.goto('/operator-productivity'); await expect(page.locator('main')).toBeVisible(); });
});
