import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
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

describe('useDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock browser APIs locally to avoid document issues
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Minimal document mock if not present
    if (typeof document !== 'undefined') {
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
      // Mock body methods
      if (!document.body) {
        (document as any).body = {
          appendChild: vi.fn(),
          removeChild: vi.fn(),
        };
      } else {
        document.body.appendChild = vi.fn();
        document.body.removeChild = vi.fn();
      }
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
