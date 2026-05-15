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
    '/track',
    '/abc',
    '/operators/productivity',
    '/reset-password',
    '/knowledge'
  ];

  for (const route of routes) {
    test(`Verify route and robustness: ${route}`, async ({ page }) => {
      // Test normal access
      await page.goto(route);
      let content = await page.content();
      expect(content).not.toContain('error-boundary');
      expect(content).not.toContain('Something went wrong');
      
      const currentUrl = page.url();
      if (currentUrl.includes('/auth')) {
        await expect(page.locator('form, h1, h2')).toBeVisible();
      } else {
        await expect(page).not.toHaveTitle(/404/);
      }

      // Test with query params fuzzing
      await page.goto(`${route}?debug=true&sqli='OR 1=1&xss=<script>alert(1)</script>&long=${'A'.repeat(500)}`);
      content = await page.content();
      expect(content).not.toContain('error-boundary');
      expect(content).not.toContain('Something went wrong');
    });
  }
});
