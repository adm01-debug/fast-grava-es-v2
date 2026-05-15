import { test, expect } from '@playwright/test';

test.describe('Exhaustive Route Testing', () => {
  const routes = [
    '/',
    '/calendar/daily',
    '/calendar/weekly',
    '/calendar/monthly',
    '/pending',
    '/alerts',
    '/kanban',
    '/kpis',
    '/efficiency',
    '/oee',
    '/spc',
    '/executive',
    '/bi',
    '/abc-costing',
    '/tpm',
    '/ml-predictions',
    '/digital-twin',
    '/operator',
    '/operators',
    '/operator-productivity',
    '/operator-history',
    '/machines',
    '/machines/compare',
    '/energy',
    '/inventory',
    '/traceability',
    '/logistics',
    '/assistant',
    '/knowledge',
    '/documents',
    '/scanner',
    '/shift-handover',
    '/gamification',
    '/notifications',
    '/integrations/bitrix24',
    '/settings',
    '/security',
    '/audit',
    '/master-api',
    '/code-quality',
    '/admin/telemetria',
    '/kiosk',
    '/design-system',
    '/install',
    '/track'
  ];

  for (const route of routes) {
    test(`Verify route: ${route}`, async ({ page }) => {
      await page.goto(route);
      
      // Check if we hit a 404 or a crash
      const content = await page.content();
      expect(content).not.toContain('error-boundary');
      expect(content).not.toContain('Something went wrong');
      
      // Verify redirection to /auth for protected routes
      const currentUrl = page.url();
      if (currentUrl.includes('/auth')) {
        await expect(page.locator('form')).toBeVisible();
      } else {
        // For public or accidentally accessible pages
        await expect(page).not.toHaveTitle(/404/);
      }
    });
  }
});
