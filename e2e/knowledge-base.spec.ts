import { test, expect } from '@playwright/test';
test.describe('Knowledge Base', () => {
  test('loads page', async ({ page }) => { await page.goto('/knowledge-base'); await expect(page.locator('main')).toBeVisible(); });
});
