import { test, expect } from '@playwright/test';

test.describe('Simulation and Stress Testing', () => {
  test('should run mass simulation and display results', async ({ page }) => {
    await page.goto('/simulation');
    
    // Check if simulation page is loaded
    await expect(page.locator('text=Simulador de Stress & Webhooks')).toBeVisible();
    
    // Set quantity to a small number for the test
    const quantityInput = page.locator('input[type="number"]');
    await quantityInput.fill('10');
    
    // Start simulation
    await page.click('text=Iniciar Simulação');
    
    // Wait for simulation to finish (check for progress bar reaching 100% or "Simulando..." text disappearing)
    await expect(page.locator('text=Simulando...')).toBeVisible();
    await expect(page.locator('text=Simulando...')).not.toBeVisible({ timeout: 30000 });
    
    // Verify results cards are visible
    await expect(page.locator('text=Taxa de Sucesso')).toBeVisible();
    await expect(page.locator('text=Latência P95')).toBeVisible();
    
    // Verify chart is rendered
    await expect(page.locator('.recharts-responsive-container')).toBeVisible();
    
    // Verify log is populated
    await expect(page.locator('text=Log Detalhado')).toBeVisible();
    const logs = page.locator('.space-y-2 >> div');
    const count = await logs.count();
    expect(count).toBeGreaterThan(0);
  });
});
