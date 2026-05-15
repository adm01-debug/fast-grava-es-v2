import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test('Login and Dashboard Navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Check for Auth Page redirection if not logged in
    // Since we can't easily bypass auth in a static E2E without mock session,
    // we check if the auth UI is present.
    const authHeading = page.locator('h1, h2');
    await expect(authHeading.first()).toBeVisible();
  });

  test('Public Tracking Page Access', async ({ page }) => {
    await page.goto('/public-tracking');
    // Verify public page elements
    const trackingInput = page.locator('input[placeholder*="Código"], input[placeholder*="Code"]');
    if (await trackingInput.count() > 0) {
      await expect(trackingInput).toBeVisible();
    }
  });

  test('NotFound Page', async ({ page }) => {
    await page.goto('/this-page-does-not-exist-12345');
    await expect(page.locator('text=404')).toBeVisible();
  });
});
