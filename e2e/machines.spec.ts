import { test, expect } from '@playwright/test';
test.describe('Machines', () => {
  test('loads page', async ({ page }) => { await page.goto('/machines'); await expect(page.locator('main')).toBeVisible(); });
});
