import { test, expect } from '@playwright/test';
test.describe('Design System', () => {
  test('loads page', async ({ page }) => { await page.goto('/design-system'); await expect(page.locator('main')).toBeVisible(); });
});
