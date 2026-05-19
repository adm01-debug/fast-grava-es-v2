import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Autenticação e Sessão', () => {
  test('deve realizar login e logout com sucesso', async ({ page }) => {
    await page.goto('/auth');
    
    // Preencher credenciais (usando dados de teste fictícios para o ambiente de dev local)
    await page.fill('input[type="email"]', 'admin@fastgravacoes.com.br');
    await page.fill('input[type="password"]', 'Fast@2026!');
    await page.click('button[type="submit"]');

    // Verificar se foi para a dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=FAST GRAVAÇÕES')).toBeVisible();

    // Abrir menu lateral se necessário e deslogar
    await page.click('button:has-text("Sair"), .lucide-log-out');
    
    // Verificar se voltou para o login
    await expect(page).toHaveURL('/auth');
  });

  test('deve proteger rotas privadas', async ({ page }) => {
    await page.goto('/settings');
    // Deve redirecionar para auth se não houver sessão
    await expect(page).toHaveURL(/\/auth/);
  });
});

test.describe('Acessibilidade Automatizada', () => {
  test('dashboard deve passar na auditoria axe', async ({ page }) => {
    // Simular login persistente para acessar dashboard
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('página de login deve passar na auditoria axe', async ({ page }) => {
    await page.goto('/auth');
    await injectAxe(page);
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('barra de navegação deve ser acessível por teclado', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    // Verificar skip links
    await expect(page.locator('text=Ir para conteúdo principal')).toBeFocused();
  });
});
