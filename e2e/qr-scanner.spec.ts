import { test, expect } from '@playwright/test';

test.describe('qr-scanner', () => {
  test('should load page', async ({ page }) => {
    await page.goto('/qr-scanner');
    await expect(page).not.toHaveURL('/404');
  });
  test('should be accessible', async ({ page }) => {
    await page.goto('/qr-scanner');
    await expect(page.locator('main')).toBeVisible();
  });
});
