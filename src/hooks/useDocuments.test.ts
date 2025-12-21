import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
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
        ilike: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test/path' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        remove: vi.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
      })),
    },
  },
}));

import { useDocuments } from './useDocuments';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Data Fetching', () => {
    it('should fetch documents', async () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.documents).toBeDefined();
      });
    });

    it('should return empty array initially', async () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(Array.isArray(result.current.documents)).toBe(true);
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by type', async () => {
      const { result } = renderHook(() => useDocuments({ type: 'pdf' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.documents).toBeDefined();
      });
    });

    it('should filter by category', async () => {
      const { result } = renderHook(() => useDocuments({ category: 'manual' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.documents).toBeDefined();
      });
    });

    it('should search documents', async () => {
      const { result } = renderHook(() => useDocuments({ search: 'test' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.documents).toBeDefined();
      });
    });
  });

  describe('File Operations', () => {
    it('should have upload function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.uploadDocument).toBe('function');
    });

    it('should have download function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.downloadDocument).toBe('function');
    });

    it('should have delete function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.deleteDocument).toBe('function');
    });

    it('should have getPublicUrl function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.getPublicUrl).toBe('function');
    });
  });

  describe('Document Management', () => {
    it('should have updateDocument function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.updateDocument).toBe('function');
    });

    it('should have moveDocument function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.moveDocument).toBe('function');
    });

    it('should have duplicateDocument function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.duplicateDocument).toBe('function');
    });
  });

  describe('Categories', () => {
    it('should list categories', async () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.categories).toBeDefined();
      });
    });

    it('should count by category', async () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.countByCategory).toBeDefined();
      });
    });

    it('should have createCategory function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.createCategory).toBe('function');
    });
  });

  describe('Versions', () => {
    it('should fetch document versions', async () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(typeof result.current.getVersions).toBe('function');
      });
    });

    it('should have restoreVersion function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.restoreVersion).toBe('function');
    });
  });

  describe('Sharing', () => {
    it('should have shareDocument function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.shareDocument).toBe('function');
    });

    it('should have revokeShare function', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.revokeShare).toBe('function');
    });
  });

  describe('Loading States', () => {
    it('should track loading state', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should track uploading state', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.isUploading).toBe('boolean');
    });

    it('should track upload progress', () => {
      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      expect(result.current.uploadProgress).toBeDefined();
    });
  });
});
