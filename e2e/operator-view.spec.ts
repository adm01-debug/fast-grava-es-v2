import { test, expect } from '@playwright/test';
test.describe('Operator View', () => {
  test('loads page', async ({ page }) => { await page.goto('/operator'); await expect(page.locator('main')).toBeVisible(); });
});
