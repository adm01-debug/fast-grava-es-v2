import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDataExport } from '../useDataExport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      then: vi.fn(),
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

// Mock URL.createObjectURL and other browser APIs
if (typeof window !== 'undefined') {
  global.URL.createObjectURL = vi.fn(() => 'mock-url');
  global.URL.revokeObjectURL = vi.fn();
}

describe('useDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof document !== 'undefined') {
      // Mock document.createElement for download link
      document.createElement = vi.fn().mockImplementation((tagName) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn(),
          };
        }
        return {};
      });
      document.body.appendChild = vi.fn();
      document.body.removeChild = vi.fn();
    }
  });

  it('should initialize with isExporting as false', () => {
    const { result } = renderHook(() => useDataExport('jobs'));
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle empty data', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    
    (supabase.from as any).mockReturnValue({
      select: mockSelect,
      order: mockOrder,
    });

    const { result } = renderHook(() => useDataExport('jobs'));
    
    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.info).toHaveBeenCalledWith('Nenhum dado para exportar');
    expect(result.current.isExporting).toBe(false);
  });

  it('should handle export error', async () => {
    const mockError = new Error('Database error');
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    const { result } = renderHook(() => useDataExport('jobs'));
    
    await act(async () => {
      await result.current.exportData();
    });

    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Database error'));
    expect(result.current.isExporting).toBe(false);
  });
});
