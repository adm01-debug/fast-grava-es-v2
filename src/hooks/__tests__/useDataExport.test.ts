import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
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

  afterEach(() => {
    cleanup();
  });

  it('should initialize with isExporting as false', () => {
    const { result } = renderHook(() => useDataExport('jobs' as any));
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle successful CSV export', async () => {
    const mockData = [
      { id: '1', name: 'Job 1', quantity: 10 },
      { id: '2', name: 'Job 2', quantity: 20 },
    ];

    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const { result } = renderHook(() => useDataExport('jobs' as any));
    
    const link = { click: vi.fn(), href: '', download: '', style: {} };
    vi.spyOn(document, 'createElement').mockReturnValue(link as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    await act(async () => {
      await result.current.exportData();
    });

    expect(supabase.from).toHaveBeenCalledWith('jobs');
    expect(toast.success).toHaveBeenCalledWith('2 registros exportados');
    expect(link.download).toContain('jobs_export_');
    expect(link.download).toContain('.csv');
  });

  it('should show info toast when no data is found', async () => {
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useDataExport('jobs' as any));
    
    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.info).toHaveBeenCalledWith('Nenhum dado para exportar');
  });

  it('should handle export errors', async () => {
    const mockError = { message: 'Database error' };
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    const { result } = renderHook(() => useDataExport('jobs' as any));
    
    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Database error'));
  });
});



