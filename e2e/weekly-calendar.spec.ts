import { test, expect } from '@playwright/test';
test.describe('Weekly Calendar', () => {
  test('loads page', async ({ page }) => { await page.goto('/calendar/weekly'); await expect(page.locator('main')).toBeVisible(); });
});
