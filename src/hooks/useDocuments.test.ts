import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDocuments } from './useDocuments';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({
        data: [
          { id: 'd1', name: 'Manual Operação', type: 'manual', category: 'operations', url: '/docs/manual.pdf', created_at: '2024-01-01' },
          { id: 'd2', name: 'Ficha Técnica CNC', type: 'technical', category: 'machines', url: '/docs/cnc.pdf', created_at: '2024-01-05' },
          { id: 'd3', name: 'Procedimento Segurança', type: 'procedure', category: 'safety', url: '/docs/safety.pdf', created_at: '2024-01-10' },
        ],
        error: null,
      })),
      insert: vi.fn(() => Promise.resolve({ data: { id: 'new' }, error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: {}, error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: '/new.pdf' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/doc.pdf' } })),
      })),
    },
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useDocuments', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('Data Fetching', () => {
    it('should fetch documents', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.documents).toBeDefined();
      expect(result.current.documents.length).toBe(3);
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });

    it('should get document by ID', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const doc = result.current.getDocumentById('d1');
      expect(doc?.name).toBe('Manual Operação');
    });
  });

  describe('Filtering', () => {
    it('should filter by type', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const manuals = result.current.filterByType('manual');
      expect(manuals.every(d => d.type === 'manual')).toBe(true);
    });

    it('should filter by category', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const machinesDocs = result.current.filterByCategory('machines');
      expect(machinesDocs.every(d => d.category === 'machines')).toBe(true);
    });

    it('should search documents', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      const results = result.current.search('Manual');
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('File Operations', () => {
    it('should have upload function', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.uploadDocument).toBe('function');
    });

    it('should have download function', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.downloadDocument).toBe('function');
    });

    it('should have delete function', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.deleteDocument).toBe('function');
    });

    it('should get public URL', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(typeof result.current.getPublicUrl).toBe('function');
    });
  });

  describe('Categories', () => {
    it('should list categories', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.categories).toContain('operations');
      expect(result.current.categories).toContain('machines');
    });

    it('should count by category', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      await waitFor(() => { expect(result.current.isLoading).toBe(false); });
      expect(result.current.countByCategory).toBeDefined();
    });
  });
});
