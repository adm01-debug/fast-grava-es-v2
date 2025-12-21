import { test, expect } from '@playwright/test';

test.describe('reports', () => {
  test('should load page', async ({ page }) => {
    await page.goto('/reports');
    await expect(page).not.toHaveURL('/404');
  });
  test('should be accessible', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('main')).toBeVisible();
  });
});
