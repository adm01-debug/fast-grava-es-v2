import { test, expect } from '@playwright/test';

test.describe('Logistics Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/logistics');
  });

  test('should verify Logistics page structure', async ({ page }) => {
    await expect(page.locator('text=Logística e Expedição')).toBeVisible();
    
    // Check for tabs
    await expect(page.locator('text=Pronto para Expedição')).toBeVisible();
    await expect(page.locator('text=Em Trânsito')).toBeVisible();
    await expect(page.locator('text=Entregue')).toBeVisible();
  });

  test('should verify Fleet Management', async ({ page }) => {
    await page.click('text=Frotas');
    await expect(page.locator('text=Gestão de Frotas')).toBeVisible();
    await expect(page.locator('text=Veículos Ativos')).toBeVisible();
  });

  test('should verify Tracking', async ({ page }) => {
    await page.goto('/public-tracking');
    await expect(page.locator('text=Rastreamento de Pedido')).toBeVisible();
    await expect(page.locator('input[placeholder="Digite o número do pedido..."]')).toBeVisible();
  });
});
