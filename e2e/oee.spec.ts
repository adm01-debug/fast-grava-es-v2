import { test, expect } from '@playwright/test';

test.describe('oee', () => {
  test('should load page', async ({ page }) => {
    await page.goto('/oee');
    await expect(page).not.toHaveURL('/404');
  });
  test('should be accessible', async ({ page }) => {
    await page.goto('/oee');
    await expect(page.locator('main')).toBeVisible();
  });
});
