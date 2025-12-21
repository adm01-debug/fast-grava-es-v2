import { test, expect } from '@playwright/test';
test.describe('Shift Handover', () => {
  test('loads page', async ({ page }) => { await page.goto('/shift-handover'); await expect(page.locator('main')).toBeVisible(); });
});
