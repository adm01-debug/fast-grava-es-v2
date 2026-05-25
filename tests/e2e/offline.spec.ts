import { test, expect } from '@playwright/test';

test.describe('Offline Syncing and Persistence', () => {
  test('should queue actions offline and show sync indicators', async ({ page, context }) => {
    await page.goto('/');
    
    // 1. Go offline
    await context.setOffline(true);
    
    // 2. Verify offline banner/toast appears
    const offlineToast = page.locator('text=Sem conexão');
    // Note: Toasts might disappear, so we check the persistent banner if it exists
    const offlineBanner = page.locator('text=Você está offline');
    await expect(offlineBanner.or(offlineToast)).toBeVisible();
    
    // 3. Mock a generic action that adds to pendingActions
    // Since we're in a real browser context, we can check localStorage
    await page.evaluate(() => {
      // Manual trigger for testing if UI buttons are not reachable
      const event = new CustomEvent('offline-action-test', { 
        detail: { type: 'create', entity: 'jobs', data: { title: 'Test' } } 
      });
      window.dispatchEvent(event);
    });

    // 4. Go back online
    await context.setOffline(false);
    
    // 5. Verify sync success notification
    const syncToast = page.locator('text=sincronizadas');
    await expect(syncToast).toBeVisible({ timeout: 15000 });
  });
});
