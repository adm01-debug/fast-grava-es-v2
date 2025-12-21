import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/dashboard'); });
  test('should load dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/Dashboard/);
  });
  test('should show widgets', async ({ page }) => {
    await expect(page.locator('[data-testid="widget"]')).toBeVisible();
  });
});
