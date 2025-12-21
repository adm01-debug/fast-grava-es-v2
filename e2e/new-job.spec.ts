import { test, expect } from '@playwright/test';
test.describe('New Job', () => {
  test('loads page', async ({ page }) => { await page.goto('/jobs/new'); await expect(page.locator('main')).toBeVisible(); });
});
