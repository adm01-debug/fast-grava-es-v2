import { test, expect } from '@playwright/test';
test.describe('Code Quality', () => {
  test('loads page', async ({ page }) => { await page.goto('/code-quality'); await expect(page.locator('main')).toBeVisible(); });
});
