import { test, expect } from '@playwright/test';

test.describe('Security - Route Permissions', () => {
  
  test('Unauthorized access redirects to /auth', async ({ page }) => {
    // Attempt to access a high-privilege route without session
    await page.goto('/settings');
    
    // Expect redirection
    await expect(page).toHaveURL(/\/auth/);
  });

  test('Sensitive headers check', async ({ page }) => {
    const response = await page.goto('/');
    if (response) {
      const headers = response.headers();
      // Basic security headers check
      // Note: Vite dev server might not have all production headers, 
      // but we check for absence of sensitive info.
      expect(headers['server']).toBeUndefined(); 
    }
  });

  test('XSS basic probe on public inputs', async ({ page }) => {
    await page.goto('/track');
    const input = page.locator('input').first();
    if (await input.isVisible()) {
      await input.fill('<script>window.xss=1</script>');
      await input.press('Enter');
      
      const xssTriggered = await page.evaluate(() => (window as any).xss === 1);
      expect(xssTriggered).toBeFalsy();
    }
  });
});
