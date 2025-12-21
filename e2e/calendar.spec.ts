import { test, expect } from '@playwright/test';
test.describe('Calendar', () => {
  test('loads daily', async ({ page }) => { await page.goto('/calendar/daily'); await expect(page.locator('main')).toBeVisible(); });
  test('loads weekly', async ({ page }) => { await page.goto('/calendar/weekly'); await expect(page.locator('main')).toBeVisible(); });
});
