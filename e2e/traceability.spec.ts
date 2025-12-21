import { test, expect } from '@playwright/test';

test.describe('traceability', () => {
  test('should load page', async ({ page }) => {
    await page.goto('/traceability');
    await expect(page).not.toHaveURL('/404');
  });
  test('should be accessible', async ({ page }) => {
    await page.goto('/traceability');
    await expect(page.locator('main')).toBeVisible();
  });
});
