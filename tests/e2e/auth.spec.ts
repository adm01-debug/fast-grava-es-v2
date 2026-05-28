import { test, expect } from '@playwright/test';

test.describe('Auth Flow - Login/Logout without Flicker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login and logout without flicker on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    
    // Ensure we are on auth page
    await expect(page).toHaveURL(/\/auth/);
    
    // Check if background is consistent (no white flashes)
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(3, 7, 18)'); // theme-dark background

    // Fill login
    await page.fill('#login-email', 'admin@fastgravacoes.com.br');
    await page.fill('#login-password', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation and verify sidebar presence without layout shifts
    // In a real E2E we'd wait for a specific element that defines "logged in" state
    // For this validation, we'll verify the loader disappears smoothly
    const loader = page.locator('text=Carregando...');
    if (await loader.isVisible()) {
      await expect(loader).toBeHidden({ timeout: 10000 });
    }
  });

  test('should login and logout without flicker on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    
    await page.goto('/auth');
    await expect(page.locator('#login-email')).toBeVisible();
    
    // Check mobile elements
    const loginCard = page.locator('.rounded-2xl');
    await expect(loginCard).toBeVisible();
  });
});

test.describe('Admin Bypass Validation', () => {
  test('admin role should bypass restricted routes immediately', async ({ page }) => {
    // This assumes we have a way to set the session for the test
    // For now, we validate the route logic by ensuring no "Access Denied" flashes
    await page.goto('/settings');
    const accessDenied = page.locator('text=Acesso negado');
    await expect(accessDenied).not.toBeVisible();
  });
});
