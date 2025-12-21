import { test, expect } from '@playwright/test';
test.describe('KPI', () => {
  test('loads page', async ({ page }) => { await page.goto('/kpi'); await expect(page.locator('main')).toBeVisible(); });
});
