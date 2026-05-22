import { test, expect } from '@playwright/test';

test.describe('Offline Syncing', () => {
  test('should queue actions offline and sync when back online', async ({ page, context }) => {
    await page.goto('/');
    
    // Simulate offline mode
    await context.setOffline(true);
    
    // Perform an action (e.g., create a job or update status)
    await page.click('[data-testid="create-job-btn"]');
    await page.fill('[name="job_title"]', 'Offline Job');
    await page.click('button[type="submit"]');
    
    // Verify it's queued (should show offline indicator)
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    
    // Simulate online mode
    await context.setOffline(false);
    
    // Verify sync starts and completes
    await expect(page.locator('[data-testid="sync-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible({ timeout: 10000 });
  });
});
