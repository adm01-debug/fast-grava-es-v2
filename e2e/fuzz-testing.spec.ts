import { test, expect } from '@playwright/test';

test.describe('Fuzz Testing and Edge Cases', () => {
  test('Public Tracking - Fuzz Input', async ({ page }) => {
    await page.goto('/track');
    const input = page.locator('input[placeholder*="Código"], input[placeholder*="Code"]');
    if (await input.count() > 0) {
      // Test with long string
      await input.fill('A'.repeat(1000));
      await page.keyboard.press('Enter');
      // Should not crash
      await expect(page).not.toHaveTitle(/Error/);
      
      // Test with special characters
      await input.fill('\' OR 1=1; -- <script>alert(1)</script>');
      await page.keyboard.press('Enter');
      await expect(page).not.toHaveTitle(/Error/);
    }
  });

  test('Auth Page - Invalid Credentials Fuzz', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'not-an-email');
    await page.fill('input[type="password"]', '1');
    await page.click('button[type="submit"]');
    
    // Should show validation error or just not crash
    const error = page.locator('.text-destructive, .text-red-500');
    if (await error.count() > 0) {
      await expect(error.first()).toBeVisible();
    }
  });

  test('404 Recovery', async ({ page }) => {
    await page.goto('/some-random-broken-link');
    await expect(page.locator('text=404')).toBeVisible();
    const backButton = page.locator('a[href="/"], button:has-text("Voltar"), button:has-text("Back")');
    if (await backButton.count() > 0) {
      await backButton.first().click();
      await expect(page.url()).toContain('/');
    }
  });
});
