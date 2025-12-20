import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useNotifications, notifyStatusChange } from './useNotifications';

// Mock data
let mockJobs: any[] = [];
let mockTechniques: any[] = [];

vi.mock('./useJobs', () => ({
  useJobs: () => ({ data: mockJobs }),
  useTechniques: () => ({ data: mockTechniques }),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('@/lib/navigation', () => ({
  navigateTo: vi.fn(),
}));

vi.mock('@/lib/errorHandling', () => ({
  createAppError: vi.fn((error) => error),
}));

// Helper to create wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data factories
const createMockJob = (overrides = {}) => ({
  id: 'job-1',
  order_number: 'ORD-001',
  client: 'Cliente A',
  product: 'Produto A',
  technique_id: 'technique-1',
  machine_id: 'machine-1',
  status: 'scheduled',
  priority: 'medium',
  quantity: 100,
  ...overrides,
});

const createMockTechnique = (overrides = {}) => ({
  id: 'technique-1',
  name: 'Laser',
  short_name: 'LSR',
  color: '#FF0000',
  setup_time: 30,
  ...overrides,
});

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockJobs = [];
    mockTechniques = [];
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should return check functions', () => {
      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current.checkDelayedJobs).toBe('function');
      expect(typeof result.current.checkReadyJobs).toBe('function');
    });

    it('should delay initial check by 2 seconds', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [createMockJob({ status: 'delayed' })];

      renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      // Should not have been called immediately
      expect(toast.error).not.toHaveBeenCalled();

      // After 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('checkDelayedJobs', () => {
    it('should show error toast for delayed jobs', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [
        createMockJob({ id: 'job-1', client: 'Cliente A', status: 'delayed' }),
        createMockJob({ id: 'job-2', client: 'Cliente B', status: 'delayed' }),
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkDelayedJobs();
      });

      expect(toast.error).toHaveBeenCalledWith(
        '2 job(s) atrasado(s)',
        expect.objectContaining({
          description: expect.stringContaining('Cliente A'),
        })
      );
    });

    it('should not show toast when no delayed jobs', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [
        createMockJob({ status: 'scheduled' }),
        createMockJob({ status: 'production' }),
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkDelayedJobs();
      });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should not check when disabled', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [createMockJob({ status: 'delayed' })];

      const { result } = renderHook(() => useNotifications({
        enableDelayedAlerts: false,
      }), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkDelayedJobs();
      });

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should show up to 3 client names in description', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [
        createMockJob({ id: 'job-1', client: 'Cliente A', status: 'delayed' }),
        createMockJob({ id: 'job-2', client: 'Cliente B', status: 'delayed' }),
        createMockJob({ id: 'job-3', client: 'Cliente C', status: 'delayed' }),
        createMockJob({ id: 'job-4', client: 'Cliente D', status: 'delayed' }),
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkDelayedJobs();
      });

      expect(toast.error).toHaveBeenCalledWith(
        '4 job(s) atrasado(s)',
        expect.objectContaining({
          description: 'Cliente A, Cliente B, Cliente C',
        })
      );
    });

    it('should include navigation action', () => {
      const { toast } = vi.mocked(require('sonner'));
      const { navigateTo } = vi.mocked(require('@/lib/navigation'));
      
      let capturedAction: any;
      toast.error.mockImplementation((title, options) => {
        capturedAction = options?.action;
      });

      mockJobs = [createMockJob({ status: 'delayed' })];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkDelayedJobs();
      });

      // Simulate clicking action
      if (capturedAction?.onClick) {
        capturedAction.onClick();
      }

      expect(navigateTo).toHaveBeenCalledWith('/alerts');
    });

    it('should handle errors gracefully', () => {
      // Jobs is undefined/null - should not throw
      mockJobs = null as any;

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(() => {
        act(() => {
          result.current.checkDelayedJobs();
        });
      }).not.toThrow();
    });
  });

  describe('checkReadyJobs (Buffer Monitoring)', () => {
    it('should warn when technique has low buffer (less than 3 ready jobs)', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockTechniques = [createMockTechnique({ id: 'technique-1', name: 'Laser' })];
      mockJobs = [
        createMockJob({ technique_id: 'technique-1', status: 'ready' }), // 1 ready
        createMockJob({ technique_id: 'technique-1', status: 'scheduled' }), // active but not ready
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkReadyJobs();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        'Buffer baixo: Laser',
        expect.objectContaining({
          description: 'Apenas 1 job(s) no jeito. Meta: 3',
        })
      );
    });

    it('should not warn when buffer is adequate (3+ ready jobs)', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockTechniques = [createMockTechnique({ id: 'technique-1', name: 'Laser' })];
      mockJobs = [
        createMockJob({ id: 'job-1', technique_id: 'technique-1', status: 'ready' }),
        createMockJob({ id: 'job-2', technique_id: 'technique-1', status: 'ready' }),
        createMockJob({ id: 'job-3', technique_id: 'technique-1', status: 'ready' }),
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkReadyJobs();
      });

      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('should check all techniques with active jobs', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockTechniques = [
        createMockTechnique({ id: 'technique-1', name: 'Laser' }),
        createMockTechnique({ id: 'technique-2', name: 'Serigrafia' }),
      ];
      mockJobs = [
        createMockJob({ id: 'job-1', technique_id: 'technique-1', status: 'ready' }),
        createMockJob({ id: 'job-2', technique_id: 'technique-2', status: 'scheduled' }), // active but 0 ready
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkReadyJobs();
      });

      // Should warn for both techniques (both have < 3 ready)
      expect(toast.warning).toHaveBeenCalledTimes(2);
    });

    it('should not check finished or cancelled jobs', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockTechniques = [createMockTechnique({ id: 'technique-1', name: 'Laser' })];
      mockJobs = [
        createMockJob({ id: 'job-1', technique_id: 'technique-1', status: 'finished' }),
        createMockJob({ id: 'job-2', technique_id: 'technique-1', status: 'cancelled' }),
      ];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkReadyJobs();
      });

      // No active jobs = no buffer check needed
      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('should not check when disabled', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockTechniques = [createMockTechnique()];
      mockJobs = [createMockJob({ status: 'scheduled' })]; // 0 ready = low buffer

      const { result } = renderHook(() => useNotifications({
        enableReadyAlerts: false,
      }), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkReadyJobs();
      });

      expect(toast.warning).not.toHaveBeenCalled();
    });

    it('should use technique short_name as fallback', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockTechniques = [createMockTechnique({ id: 'technique-1', name: null, short_name: 'LSR' })];
      mockJobs = [createMockJob({ technique_id: 'technique-1', status: 'scheduled' })];

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkReadyJobs();
      });

      expect(toast.warning).toHaveBeenCalledWith(
        'Buffer baixo: LSR',
        expect.any(Object)
      );
    });
  });

  describe('Periodic Checks', () => {
    it('should run periodic checks at configured interval', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [createMockJob({ status: 'delayed' })];

      renderHook(() => useNotifications({
        checkIntervalMs: 5000, // 5 seconds
      }), {
        wrapper: createWrapper(),
      });

      // Initial check after 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(toast.error).toHaveBeenCalledTimes(1);

      // Periodic check at 5 seconds (2 + 5 = 7)
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(toast.error).toHaveBeenCalledTimes(2);

      // Another periodic check
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(toast.error).toHaveBeenCalledTimes(3);
    });

    it('should use default 1 minute interval', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [createMockJob({ status: 'delayed' })];

      renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      // Initial check
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(toast.error).toHaveBeenCalledTimes(1);

      // Should not trigger at 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(toast.error).toHaveBeenCalledTimes(1);

      // Should trigger at 60 seconds (total 62 seconds)
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      expect(toast.error).toHaveBeenCalledTimes(2);
    });

    it('should cleanup intervals on unmount', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockJobs = [createMockJob({ status: 'delayed' })];

      const { unmount } = renderHook(() => useNotifications({
        checkIntervalMs: 5000,
      }), {
        wrapper: createWrapper(),
      });

      // Initial check
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(toast.error).toHaveBeenCalledTimes(1);

      // Unmount
      unmount();

      // Advance past interval - should not trigger more checks
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });
});

describe('notifyStatusChange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show success toast for finished status', () => {
    const { toast } = vi.mocked(require('sonner'));

    notifyStatusChange('Cliente A', 'production', 'finished');

    expect(toast.success).toHaveBeenCalledWith(
      'Job finalizado: Cliente A',
      expect.objectContaining({
        description: 'Produção concluída com sucesso',
      })
    );
  });

  it('should show error toast for delayed status', () => {
    const { toast } = vi.mocked(require('sonner'));

    notifyStatusChange('Cliente B', 'production', 'delayed');

    expect(toast.error).toHaveBeenCalledWith(
      'Job atrasado: Cliente B',
      expect.objectContaining({
        description: 'Atenção necessária',
      })
    );
  });

  it('should show info toast for production status', () => {
    const { toast } = vi.mocked(require('sonner'));

    notifyStatusChange('Cliente C', 'scheduled', 'production');

    expect(toast.info).toHaveBeenCalledWith(
      'Produção iniciada: Cliente C',
      expect.objectContaining({
        description: 'Job em andamento',
      })
    );
  });

  it('should show default toast for other status changes', () => {
    const { toast } = vi.mocked(require('sonner'));

    notifyStatusChange('Cliente D', 'queue', 'ready');

    expect(toast).toHaveBeenCalledWith(
      'Status alterado: Cliente D',
      expect.objectContaining({
        description: 'Novo status: No Jeito',
      })
    );
  });

  it('should handle all status labels correctly', () => {
    const { toast } = vi.mocked(require('sonner'));
    
    const statusLabels = [
      { status: 'queue', label: 'Na Fila' },
      { status: 'ready', label: 'No Jeito' },
      { status: 'scheduled', label: 'Agendado' },
      { status: 'paused', label: 'Pausado' },
      { status: 'rework', label: 'Retrabalho' },
    ];

    statusLabels.forEach(({ status, label }) => {
      vi.clearAllMocks();
      notifyStatusChange('Cliente', 'any', status);
      
      expect(toast).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          description: `Novo status: ${label}`,
        })
      );
    });
  });

  it('should use raw status if no label mapping exists', () => {
    const { toast } = vi.mocked(require('sonner'));

    notifyStatusChange('Cliente', 'any', 'unknown_status');

    expect(toast).toHaveBeenCalledWith(
      'Status alterado: Cliente',
      expect.objectContaining({
        description: 'Novo status: unknown_status',
      })
    );
  });
});
