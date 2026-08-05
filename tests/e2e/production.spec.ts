import { test, expect } from '@playwright/test';

test.describe('Production and Jobs Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app and login if necessary
    // For now, assuming we start at the dashboard
    await page.goto('/');
  });

  test('should navigate to Kanban and verify jobs', async ({ page }) => {
    await page.click('text=Produção');
    await page.click('text=Quadro Kanban');
    await expect(page).toHaveURL(/.*kanban/);
    
    // Check if Kanban board is rendered
    await expect(page.locator('.kanban-column')).toBeVisible();
    await expect(page.locator('text=Pendente')).toBeVisible();
    await expect(page.locator('text=Em Produção')).toBeVisible();
  });

  test('should create a new job', async ({ page }) => {
    await page.goto('/new-job');
    
    // Fill the form
    await page.fill('input[name="order_number"]', `ORD-${Date.now()}`);
    await page.fill('input[name="client"]', 'Test Client');
    await page.fill('input[name="product"]', 'Test Product');
    await page.fill('input[name="quantity"]', '1000');
    
    // Select technique
    await page.click('button[role="combobox"]:has-text("Selecione a técnica")');
    await page.click('role=option >> nth=0');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Success toast check (assuming it appears)
    await expect(page.locator('text=Trabalho criado com sucesso')).toBeVisible();
  });

  test('should verify OEE Dashboard', async ({ page }) => {
    await page.goto('/oee');
    await expect(page).toHaveURL(/.*oee/);
    
    // Check for OEE cards
    await expect(page.locator('text=Disponibilidade')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Qualidade')).toBeVisible();
    
    // Check if machine OEE table is visible
    await expect(page.locator('table')).toBeVisible();
  });

  test('should verify Operators Productivity', async ({ page }) => {
    await page.goto('/operator-productivity');
    await expect(page.locator('text=Produtividade dos Operadores')).toBeVisible();
    
    // Check for charts
    await expect(page.locator('canvas')).toBeVisible();
  });
});
