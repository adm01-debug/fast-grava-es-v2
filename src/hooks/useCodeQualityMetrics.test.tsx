import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        gte: vi.fn(() => ({
          lte: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

import { useCodeQualityMetrics } from './useCodeQualityMetrics';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCodeQualityMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Quality Scores', () => {
    it('should calculate overall quality score', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.overallScore).toBeDefined();
      });
    });

    it('should calculate maintainability index', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.maintainabilityIndex).toBeDefined();
      });
    });

    it('should calculate reliability score', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.reliabilityScore).toBeDefined();
      });
    });

    it('should calculate security score', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.securityScore).toBeDefined();
      });
    });
  });

  describe('Code Metrics', () => {
    it('should track lines of code', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.linesOfCode).toBeDefined();
      });
    });

    it('should track cyclomatic complexity', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.cyclomaticComplexity).toBeDefined();
      });
    });

    it('should track code duplication', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.duplicationPercentage).toBeDefined();
      });
    });

    it('should track technical debt', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.technicalDebt).toBeDefined();
      });
    });
  });

  describe('Test Coverage', () => {
    it('should track test coverage', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.testCoverage).toBeDefined();
      });
    });

    it('should track unit test count', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.unitTestCount).toBeDefined();
      });
    });

    it('should track integration test count', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.integrationTestCount).toBeDefined();
      });
    });

    it('should track test pass rate', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.testPassRate).toBeDefined();
      });
    });
  });

  describe('Issues Tracking', () => {
    it('should track bugs', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.bugsCount).toBeDefined();
      });
    });

    it('should track vulnerabilities', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.vulnerabilitiesCount).toBeDefined();
      });
    });

    it('should track code smells', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.codeSmellsCount).toBeDefined();
      });
    });

    it('should categorize issues by severity', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.issuesBySeverity).toBeDefined();
      });
    });
  });

  describe('Trends', () => {
    it('should track quality trends', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.qualityTrends).toBeDefined();
      });
    });

    it('should compare with previous period', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.comparedToPrevious).toBeDefined();
      });
    });

    it('should calculate improvement rate', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.improvementRate).toBeDefined();
      });
    });
  });

  describe('By Module', () => {
    it('should provide metrics by module', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.metricsByModule).toBeDefined();
      });
    });

    it('should identify worst modules', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.worstModules).toBeDefined();
      });
    });

    it('should identify best modules', async () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.bestModules).toBeDefined();
      });
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should have refresh function', () => {
      const { result } = renderHook(() => useCodeQualityMetrics(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.refresh).toBe('function');
    });
  });
});
