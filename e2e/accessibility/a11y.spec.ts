import { test, expect } from '@playwright/test';

test.describe('Accessibility (A11y) Checks', () => {
  const criticalPages = [
    '/',
    '/auth',
    '/calendar/daily',
    '/operator',
    '/kanban',
    '/settings'
  ];

  for (const pagePath of criticalPages) {
    test(`A11y check for ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      // Basic accessibility checks using native Playwright/Aria
      // We check if main interactive elements have proper labels/roles
      
      const buttons = await page.getByRole('button').all();
      for (const button of buttons) {
        const name = await button.accessibleName();
        // Skip hidden buttons or decorative ones, but logged warning if no name
        if (!name && await button.isVisible()) {
          console.warn(`Button on ${pagePath} missing accessible name`);
        }
      }

      const inputs = await page.getByRole('textbox').all();
      for (const input of inputs) {
        const label = await input.accessibleName();
        if (!label && await input.isVisible()) {
          console.warn(`Input on ${pagePath} missing label`);
        }
      }
      
      // Images should have alt text
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        if (alt === null) {
          console.warn(`Image on ${pagePath} missing alt attribute`);
        }
      }
    });
  }
});
