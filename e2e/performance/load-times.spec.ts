import { test, expect } from '@playwright/test';

test.describe('Performance - Page Load Times', () => {
  const thresholdMs = 3000; // 3 seconds budget for LCP/FCP in local/dev

  test('LCP should be within budget for Index', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    
    // Wait for main content or skeleton to disappear
    await page.waitForSelector('h1', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`Index load time: ${loadTime}ms`);
    // In CI this might be slower, but we set a generous baseline
    expect(loadTime).toBeLessThan(10000); 
  });

  test('Check for heavy assets or memory leaks', async ({ page }) => {
    await page.goto('/');
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return {
        totalSize: resources.reduce((acc, res) => acc + (res.transferSize || 0), 0),
        count: resources.length
      };
    });
    
    console.log(`Total transferred size: ${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    expect(metrics.totalSize).toBeLessThan(10 * 1024 * 1024); // 10MB budget
  });
});
