import { test, expect } from '@playwright/test';

test.describe('Admin and Settings Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
  });

  test('should verify settings page structure', async ({ page }) => {
    await expect(page.locator('text=Configurações do Sistema')).toBeVisible();
    await expect(page.locator('text=Perfil')).toBeVisible();
    await expect(page.locator('text=Segurança')).toBeVisible();
  });

  test('should navigate to Admin Telemetry', async ({ page }) => {
    await page.goto('/admin-telemetria');
    await expect(page.locator('text=Telemetria do Sistema')).toBeVisible();
    await expect(page.locator('text=Performance de Queries')).toBeVisible();
  });

  test('should navigate to Audit Trail', async ({ page }) => {
    await page.goto('/audit-trail');
    await expect(page.locator('text=Trilha de Auditoria')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should verify Code Quality Dashboard', async ({ page }) => {
    await page.goto('/code-quality');
    await expect(page.locator('text=Qualidade de Código')).toBeVisible();
    await expect(page.locator('text=Meta 10/10')).toBeVisible();
  });
});
