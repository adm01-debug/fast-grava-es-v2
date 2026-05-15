import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Tests', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('Dashboard is usable on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check if navigation menu collapses into a drawer/burger
    const menuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu"), .mobile-menu-trigger');
    // We expect some form of mobile menu trigger or at least no horizontal overflow
    
    const viewportWidth = page.viewportSize()?.width || 0;
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px subpixel rounding
  });

  test('Auth form is centered and readable on small screens', async ({ page }) => {
    await page.goto('/auth');
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    const box = await form.boundingBox();
    if (box) {
      expect(box.width).toBeLessThanOrEqual(375);
    }
  });
});
