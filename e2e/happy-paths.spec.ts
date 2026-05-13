import { test, expect } from '@playwright/test';

const TEST_ACCOUNTS = {
  COORDINATOR: { email: 'teste.coordenador@promobrindes.com.br', pass: 'Teste@123' },
  OPERATOR: { email: 'teste.operador@promobrindes.com.br', pass: 'Teste@123' },
  MANAGER: { email: 'teste.gestor@promobrindes.com.br', pass: 'Teste@123' },
};

test.describe('Happy Paths - Fluxos Críticos', () => {
  
  test('Deve realizar login com sucesso como Coordenador', async ({ page }) => {
    await page.goto('/auth');
    
    // Preencher credenciais
    await page.fill('input[type="email"]', TEST_ACCOUNTS.COORDINATOR.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.COORDINATOR.pass);
    
    // Clicar em Entrar
    await page.click('button:has-text("Entrar")');
    
    // Verificar se redirecionou para o dashboard (ou home)
    await expect(page).toHaveURL(/\/(dashboard|calendar)?/);
    
    // Verificar se elementos do dashboard aparecem
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('Deve visualizar calendário de produção', async ({ page }) => {
    // Reutilizar login ou usar state (simplificado aqui)
    await page.goto('/auth');
    await page.fill('input[type="email"]', TEST_ACCOUNTS.COORDINATOR.email);
    await page.fill('input[type="password"]', TEST_ACCOUNTS.COORDINATOR.pass);
    await page.click('button:has-text("Entrar")');
    
    await page.goto('/calendar');
    await expect(page.locator('.rbc-calendar')).toBeVisible();
  });

  // Outros caminhos felizes seriam adicionados aqui...
});
