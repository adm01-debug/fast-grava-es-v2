import { test, expect } from '@playwright/test';
test.describe('Documents', () => {
  test('loads page', async ({ page }) => { await page.goto('/documents'); await expect(page.locator('main')).toBeVisible(); });
});
