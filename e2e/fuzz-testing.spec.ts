import { test, expect } from '@playwright/test';

test.describe('Exhaustive Fuzz Testing and Edge Cases', () => {
  test('Public Tracking - Fuzz Input', async ({ page }) => {
    await page.goto('/track');
    const input = page.locator('input[placeholder*="Código"], input[placeholder*="Code"]');
    if (await input.count() > 0) {
      // Test with long string (Exhaustive)
      await input.fill('A'.repeat(5000));
      await page.keyboard.press('Enter');
      await expect(page).not.toHaveTitle(/Error/);
      
      // Test with SQLi and XSS payloads
      const maliciousPayloads = [
        '\' OR 1=1; --',
        '<script>alert(1)</script>',
        '${7*7}',
        '{{7*7}}',
        '/etc/passwd',
        '%20',
        '\\x00'
      ];

      for (const payload of maliciousPayloads) {
        await input.fill(payload);
        await page.keyboard.press('Enter');
        await expect(page).not.toHaveTitle(/Error/);
      }
    }
  });

  test('Auth Page - Exhaustive Credential Fuzzing', async ({ page }) => {
    await page.goto('/auth');
    const scenarios = [
      { email: 'not-an-email', pass: '1' },
      { email: 'admin@example.com', pass: 'A'.repeat(1000) },
      { email: '\' OR \'1\'=\'1', pass: 'password' },
      { email: '<svg/onload=alert(1)>', pass: '123' },
      { email: 'user@example.com', pass: '\0' }
    ];

    for (const scenario of scenarios) {
      await page.fill('input[type="email"]', scenario.email);
      await page.fill('input[type="password"]', scenario.pass);
      await page.click('button[type="submit"]');
      // Should show validation error or just not crash
      await expect(page).not.toHaveTitle(/Error/);
    }
  });

  test('Technical Assistant - Fuzz Prompt', async ({ page }) => {
    await page.goto('/assistant');
    // Check if redirect to auth
    if (page.url().includes('/auth')) return;

    const textarea = page.locator('textarea');
    if (await textarea.count() > 0) {
      await textarea.fill('Explain fiber laser with 1 million words ' + 'A'.repeat(1000));
      await page.keyboard.press('Enter');
      await expect(page).not.toHaveTitle(/Error/);
    }
  });

  test('404 Recovery and Deep Links', async ({ page }) => {
    const brokenLinks = [
      '/some-random-broken-link',
      '/admin/%00',
      '/../../../../etc/passwd',
      '/<>\"\'%;)(&+'
    ];

    for (const link of brokenLinks) {
      await page.goto(link);
      await expect(page.locator('text=404')).toBeVisible();
      const backButton = page.locator('a[href="/"], button:has-text("Voltar"), button:has-text("Back")');
      if (await backButton.count() > 0) {
        await backButton.first().click();
        await expect(page.url()).toContain('/');
      }
    }
  });
});
