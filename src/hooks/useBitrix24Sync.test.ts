import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useBitrix24Sync } from './useBitrix24Sync';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock environment variables
vi.stubEnv('VITE_SUPABASE_PROJECT_ID', 'test-project');
vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key');

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useBitrix24Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.lastSync).toBeNull();
      expect(result.current.oauthStatus).toBeNull();
      expect(typeof result.current.testConnection).toBe('function');
      expect(typeof result.current.pullFromBitrix).toBe('function');
      expect(typeof result.current.pushToBitrix).toBe('function');
      expect(typeof result.current.checkOAuthStatus).toBe('function');
      expect(typeof result.current.clearTokens).toBe('function');
    });
  });

  describe('checkOAuthStatus', () => {
    it('should fetch and update OAuth status successfully', async () => {
      const mockOAuthStatus = {
        tokenStatus: 'valid',
        tokenExpiry: '2024-12-31T23:59:59Z',
        needsReauthorization: false,
        reauthorizationReason: '',
        hasClientCredentials: true,
        authorizationUrl: 'https://bitrix24.com/oauth'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOAuthStatus)
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.checkOAuthStatus();
      });

      expect(result.current.oauthStatus).toEqual(mockOAuthStatus);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle OAuth status error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'OAuth error' })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.checkOAuthStatus();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro ao verificar OAuth',
          variant: 'destructive'
        })
      );
    });

    it('should set loading state during OAuth check', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ tokenStatus: 'valid' })
        }), 100))
      );

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      const promise = act(async () => {
        result.current.checkOAuthStatus();
      });

      // Should be loading immediately after call
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await promise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.testConnection();
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Conexão OK',
          description: 'Conexão com Bitrix24 estabelecida com sucesso.'
        })
      );
    });

    it('should handle expired token error', async () => {
      // First call - test connection fails with expired token
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'invalid_token' })
      });

      // Second call - OAuth status check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ needsReauthorization: true })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.testConnection();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Token expirado',
          variant: 'destructive'
        })
      );
    });

    it('should handle generic connection error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Connection refused' })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.testConnection();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro de conexão',
          variant: 'destructive'
        })
      );
    });
  });

  describe('pullFromBitrix', () => {
    it('should pull jobs successfully', async () => {
      const mockResult = {
        synced: ['job-1', 'job-2', 'job-3'],
        total: 3
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult)
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.pullFromBitrix();
      });

      expect(result.current.lastSync).not.toBeNull();
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sincronização concluída',
          description: '3 jobs sincronizados do Bitrix24.'
        })
      );
    });

    it('should pull jobs with category filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ synced: ['job-1'] })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.pullFromBitrix('category-123');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('pull'),
        expect.objectContaining({
          body: JSON.stringify({ categoryId: 'category-123' })
        })
      );
    });

    it('should handle authentication error during pull', async () => {
      // First call - pull fails with auth error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'authentication failed' })
      });

      // Second call - OAuth status check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ needsReauthorization: true })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.pullFromBitrix();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Token expirado',
          variant: 'destructive'
        })
      );
    });

    it('should update lastSync timestamp after successful pull', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ synced: [] })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      expect(result.current.lastSync).toBeNull();

      await act(async () => {
        await result.current.pullFromBitrix();
      });

      expect(result.current.lastSync).toBeInstanceOf(Date);
    });
  });

  describe('pushToBitrix', () => {
    it('should push status update successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.pushToBitrix('job-123', 'finished');
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('push'),
        expect.objectContaining({
          body: JSON.stringify({ jobId: 'job-123', status: 'finished' })
        })
      );
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Status atualizado'
        })
      );
    });

    it('should not show toast for skipped jobs (non-Bitrix jobs)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ skipped: true })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.pushToBitrix('local-job-123', 'finished');
      });

      expect(mockToast).not.toHaveBeenCalled();
    });

    it('should return error object on push failure (silent failure)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Push failed' })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      let pushResult;
      await act(async () => {
        pushResult = await result.current.pushToBitrix('job-123', 'finished');
      });

      // Should return error object, not throw
      expect(pushResult).toEqual(expect.objectContaining({
        error: expect.any(String)
      }));
      // Should not show error toast for non-Bitrix jobs
      expect(mockToast).not.toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'destructive'
        })
      );
    });
  });

  describe('clearTokens', () => {
    it('should clear tokens successfully', async () => {
      // First call - clear tokens
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Tokens cleared successfully' })
      });

      // Second call - check OAuth status
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tokenStatus: 'no_tokens' })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.clearTokens();
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Tokens removidos'
        })
      );
      expect(result.current.oauthStatus?.tokenStatus).toBe('no_tokens');
    });

    it('should handle clear tokens error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to clear tokens' })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.clearTokens();
        } catch (e) {
          // Expected error
        }
      });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Erro ao limpar tokens',
          variant: 'destructive'
        })
      );
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      // First two calls fail with network error
      mockFetch
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockRejectedValueOnce(new Error('fetch failed'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.testConnection();
      });

      // Should have made 3 calls (2 retries + 1 success)
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Conexão OK'
        })
      );
    });

    it('should retry on 5xx server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: '503 Service Unavailable' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.testConnection();
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 4xx client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Bad request' })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.testConnection();
        } catch (e) {
          // Expected error
        }
      });

      // Should have made only 1 call (no retries)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should fail after max retries', async () => {
      // All calls fail
      mockFetch.mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        try {
          await result.current.testConnection();
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
        }
      });

      // Should have made 4 calls (1 initial + 3 retries)
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('API URL Construction', () => {
    it('should construct correct API URL with action parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const { result } = renderHook(() => useBitrix24Sync(), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.testConnection();
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-project.supabase.co/functions/v1/bitrix24-sync?action=test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'apikey': 'test-key'
          })
        })
      );
    });
  });
});
