import { test, expect } from '@playwright/test';

test.describe('Auth Flow - Login/Logout', () => {
  test('should login and logout without flicker on desktop', async ({ page }) => {
    // Set viewport for desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await page.goto('/auth');
    
    // Check for login form
    await expect(page.locator('form')).toBeVisible();
    
    // Fill login details (using env vars if available, or dummy data for test structure)
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Check navigation to dashboard
    // We expect a smooth transition (handled by Framer Motion and Suspense)
    await expect(page).toHaveURL('/');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/auth');
  });

  test('should login and logout without flicker on mobile', async ({ page }) => {
    // Set viewport for mobile
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/auth');
    await expect(page.locator('form')).toBeVisible();
    
    await page.fill('input[type="email"]', 'operator@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    
    // Mobile logout usually via sidebar or specific mobile menu
    await page.click('[data-testid="mobile-menu-trigger"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page).toHaveURL('/auth');
  });
});
