import { test, expect } from '@playwright/test';

test.describe('notifications', () => {
  test('should load page', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page).not.toHaveURL('/404');
  });
  test('should be accessible', async ({ page }) => {
    await page.goto('/notifications');
    await expect(page.locator('main')).toBeVisible();
  });
});
