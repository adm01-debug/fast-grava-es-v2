import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataExport } from '../useDataExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock URL and Blob
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('useDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize and handle export operations', async () => {
    const { result } = renderHook(() => useDataExport('jobs' as any));
    expect(result.current.isExporting).toBe(false);

    // 1. Success
    const mockData = [{ id: '1', name: 'Job 1' }];
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null });

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: mockOrder,
    });

    const link = { click: vi.fn(), href: '', download: '', style: {} };
    const createSpy = vi.spyOn(document, 'createElement').mockReturnValue(link as any);
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.success).toHaveBeenCalledWith('1 registros exportados');

    // 2. Empty
    mockOrder.mockResolvedValue({ data: [], error: null });

    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.info).toHaveBeenCalledWith('Nenhum dado para exportar');

    // 3. Error
    const mockError = new Error('Connection failed');
    mockOrder.mockResolvedValue({ data: null, error: mockError });

    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Connection failed'));

    createSpy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
