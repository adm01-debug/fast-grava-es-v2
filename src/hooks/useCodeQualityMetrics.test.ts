import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCodeQualityMetrics } from './useCodeQualityMetrics';

describe('useCodeQualityMetrics', () => {
  describe('Test Files', () => {
    it('should return test files array', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(Array.isArray(result.current.testFiles)).toBe(true);
      expect(result.current.testFiles.length).toBeGreaterThan(0);
    });

    it('should have correct structure for each test file', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      result.current.testFiles.forEach(file => {
        expect(file).toHaveProperty('name');
        expect(file).toHaveProperty('path');
        expect(file).toHaveProperty('testCount');
        expect(file).toHaveProperty('category');
        expect(['unit', 'integration', 'e2e']).toContain(file.category);
        expect(typeof file.testCount).toBe('number');
        expect(file.testCount).toBeGreaterThan(0);
      });
    });
  });

  describe('Test Counts', () => {
    it('should calculate total tests', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(result.current.totalTests).toBeGreaterThan(0);
    });

    it('should categorize tests correctly', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      const { testsByCategory } = result.current;
      expect(testsByCategory.unit).toBeGreaterThan(0);
      expect(testsByCategory.integration).toBeGreaterThan(0);
      expect(testsByCategory.e2e).toBeGreaterThanOrEqual(0);

      const sum = testsByCategory.unit + testsByCategory.integration + testsByCategory.e2e;
      expect(sum).toBe(result.current.totalTests);
    });
  });

  describe('Coverage Estimate', () => {
    it('should return coverage estimate between 0 and 100', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(result.current.coverageEstimate).toBeGreaterThanOrEqual(0);
      expect(result.current.coverageEstimate).toBeLessThanOrEqual(100);
    });
  });

  describe('Component Metrics', () => {
    it('should count components with and without tests', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(result.current.componentsWithTests).toBeGreaterThanOrEqual(0);
      expect(result.current.componentsWithoutTests).toBeGreaterThanOrEqual(0);
      expect(result.current.componentsWithTests + result.current.componentsWithoutTests).toBeGreaterThan(0);
    });
  });

  describe('Hooks Coverage', () => {
    it('should track hooks coverage', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(result.current.hooksCovered).toBeGreaterThanOrEqual(0);
      expect(result.current.hooksTotal).toBeGreaterThan(0);
      expect(result.current.hooksCovered).toBeLessThanOrEqual(result.current.hooksTotal);
    });
  });

  describe('Complexity Distribution', () => {
    it('should categorize complexity levels', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      const { complexityDistribution } = result.current;
      expect(complexityDistribution.low).toBeGreaterThanOrEqual(0);
      expect(complexityDistribution.medium).toBeGreaterThanOrEqual(0);
      expect(complexityDistribution.high).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Build Metrics', () => {
    it('should return build metrics', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      const { buildMetrics } = result.current;
      expect(buildMetrics.estimatedBuildTime).toBeGreaterThan(0);
      expect(buildMetrics.bundleSizeEstimate).toBeGreaterThan(0);
      expect(buildMetrics.lazyLoadedPages).toBeGreaterThanOrEqual(0);
      expect(buildMetrics.totalPages).toBeGreaterThan(0);
      expect(buildMetrics.edgeFunctions).toBeGreaterThanOrEqual(0);
      expect(buildMetrics.dependencies).toBeGreaterThan(0);
      expect(buildMetrics.devDependencies).toBeGreaterThanOrEqual(0);
    });

    it('should have lazy loaded pages <= total pages', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(result.current.buildMetrics.lazyLoadedPages).toBeLessThanOrEqual(
        result.current.buildMetrics.totalPages
      );
    });
  });

  describe('Performance Metrics', () => {
    it('should return performance metrics', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      const { performanceMetrics } = result.current;
      expect(performanceMetrics.lighthouseScore).toBeGreaterThanOrEqual(0);
      expect(performanceMetrics.lighthouseScore).toBeLessThanOrEqual(100);
      expect(performanceMetrics.firstContentfulPaint).toBeGreaterThan(0);
      expect(performanceMetrics.largestContentfulPaint).toBeGreaterThan(0);
      expect(performanceMetrics.timeToInteractive).toBeGreaterThan(0);
      expect(performanceMetrics.codeChunks).toBeGreaterThan(0);
      expect(typeof performanceMetrics.treeshakingEnabled).toBe('boolean');
    });

    it('should have LCP >= FCP', () => {
      const { result } = renderHook(() => useCodeQualityMetrics());

      expect(result.current.performanceMetrics.largestContentfulPaint).toBeGreaterThanOrEqual(
        result.current.performanceMetrics.firstContentfulPaint
      );
    });
  });

  describe('Memoization', () => {
    it('should return stable reference', () => {
      const { result, rerender } = renderHook(() => useCodeQualityMetrics());

      const firstResult = result.current;
      rerender();
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });
});
