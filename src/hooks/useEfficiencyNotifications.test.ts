import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useEfficiencyNotifications } from './useEfficiencyNotifications';

// Mock dependencies
const mockBottleneckAlerts: any[] = [];
const mockLoadBalancingSuggestions: any[] = [];
const mockActiveAlerts: any[] = [];
const mockRecordAlert = vi.fn();
const mockResolveAlert = vi.fn();

vi.mock('./useBottleneckPrediction', () => ({
  useBottleneckPrediction: () => ({
    alerts: mockBottleneckAlerts,
    criticalCount: mockBottleneckAlerts.filter(a => a.severity === 'critical').length,
    warningCount: mockBottleneckAlerts.filter(a => a.severity === 'warning').length,
  }),
}));

vi.mock('./useLoadBalancing', () => ({
  useLoadBalancing: () => ({
    suggestions: mockLoadBalancingSuggestions,
  }),
}));

vi.mock('./useEfficiencyAlertHistory', () => ({
  useEfficiencyAlertHistory: () => ({
    activeAlerts: mockActiveAlerts,
    recordAlert: { mutate: mockRecordAlert },
    resolveAlert: { mutate: mockResolveAlert },
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/lib/navigation', () => ({
  navigateTo: vi.fn(),
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
const createMockBottleneckAlert = (overrides = {}) => ({
  techniqueId: 'technique-1',
  techniqueName: 'Laser',
  date: new Date('2024-12-20'),
  severity: 'warning',
  message: 'Capacidade próxima do limite',
  currentCapacity: 85,
  projectedCapacity: 95,
  jobCount: 10,
  pendingJobCount: 5,
  machineCount: 3,
  ...overrides,
});

const createMockLoadBalancingSuggestion = (overrides = {}) => ({
  jobId: 'job-1',
  orderNumber: 'ORD-001',
  client: 'Cliente A',
  currentMachineId: 'machine-1',
  currentMachineName: 'Laser 01',
  suggestedMachineId: 'machine-2',
  suggestedMachineName: 'Laser 02',
  loadDifference: 20,
  ...overrides,
});

const createMockActiveAlert = (overrides = {}) => ({
  id: 'alert-1',
  alert_type: 'bottleneck',
  severity: 'warning',
  title: 'Gargalo detectado',
  description: 'Descrição do alerta',
  technique_id: 'technique-1',
  machine_id: null,
  metadata: {
    date: '2024-12-20',
  },
  ...overrides,
});

describe('useEfficiencyNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset mock arrays
    mockBottleneckAlerts.length = 0;
    mockLoadBalancingSuggestions.length = 0;
    mockActiveAlerts.length = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial State', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.bottleneckCount).toBe(0);
      expect(result.current.loadBalancingCount).toBe(0);
      expect(typeof result.current.checkBottleneckAlerts).toBe('function');
      expect(typeof result.current.checkLoadBalancingAlerts).toBe('function');
    });

    it('should not show notifications during initialization', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockBottleneckAlerts.push(createMockBottleneckAlert({ severity: 'critical' }));

      renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Should not trigger notifications before initialization period (3 seconds)
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('Bottleneck Alerts', () => {
    it('should count bottleneck alerts correctly', () => {
      mockBottleneckAlerts.push(
        createMockBottleneckAlert({ severity: 'critical' }),
        createMockBottleneckAlert({ severity: 'warning', techniqueId: 'technique-2' })
      );

      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.bottleneckCount).toBe(2);
    });

    it('should show error toast for new critical bottleneck after initialization', async () => {
      const { toast } = vi.mocked(require('sonner'));
      
      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization period
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Add new bottleneck alert
      mockBottleneckAlerts.push(createMockBottleneckAlert({ severity: 'critical' }));

      rerender();

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('alerta'),
          expect.objectContaining({
            description: expect.any(String),
          })
        );
      });
    });

    it('should show warning toast for non-critical bottlenecks', async () => {
      const { toast } = vi.mocked(require('sonner'));
      
      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Add warning alert (not critical)
      mockBottleneckAlerts.push(createMockBottleneckAlert({ severity: 'warning' }));

      rerender();

      await waitFor(() => {
        expect(toast.warning).toHaveBeenCalled();
      });
    });

    it('should record new bottleneck alerts to history', async () => {
      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Add new bottleneck alert
      const newAlert = createMockBottleneckAlert({ severity: 'critical' });
      mockBottleneckAlerts.push(newAlert);

      rerender();

      await waitFor(() => {
        expect(mockRecordAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            alert_type: 'bottleneck',
            severity: 'error',
            title: expect.stringContaining('Gargalo'),
            technique_id: newAlert.techniqueId,
          })
        );
      });
    });

    it('should not trigger alerts when disabled', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockBottleneckAlerts.push(createMockBottleneckAlert({ severity: 'critical' }));

      const { rerender } = renderHook(() => useEfficiencyNotifications({
        enableBottleneckAlerts: false,
      }), {
        wrapper: createWrapper(),
      });

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      rerender();

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  describe('Load Balancing Suggestions', () => {
    it('should count load balancing suggestions correctly', () => {
      mockLoadBalancingSuggestions.push(
        createMockLoadBalancingSuggestion({ jobId: 'job-1' }),
        createMockLoadBalancingSuggestion({ jobId: 'job-2' })
      );

      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loadBalancingCount).toBe(2);
    });

    it('should show info toast for new load balancing suggestions', async () => {
      const { toast } = vi.mocked(require('sonner'));
      
      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Add new suggestion
      mockLoadBalancingSuggestions.push(createMockLoadBalancingSuggestion());

      rerender();

      await waitFor(() => {
        expect(toast.info).toHaveBeenCalledWith(
          expect.stringContaining('sugestão'),
          expect.objectContaining({
            description: expect.any(String),
          })
        );
      });
    });

    it('should record new load balancing suggestions to history', async () => {
      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // Add new suggestion
      const suggestion = createMockLoadBalancingSuggestion();
      mockLoadBalancingSuggestions.push(suggestion);

      rerender();

      await waitFor(() => {
        expect(mockRecordAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            alert_type: 'load_balancing',
            severity: 'info',
            title: 'Balanceamento de Carga',
            machine_id: suggestion.currentMachineId,
          })
        );
      });
    });

    it('should not trigger alerts when disabled', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockLoadBalancingSuggestions.push(createMockLoadBalancingSuggestion());

      const { rerender } = renderHook(() => useEfficiencyNotifications({
        enableLoadBalancingAlerts: false,
      }), {
        wrapper: createWrapper(),
      });

      act(() => {
        vi.advanceTimersByTime(3500);
      });

      rerender();

      expect(toast.info).not.toHaveBeenCalled();
    });
  });

  describe('Auto-Resolution', () => {
    it('should auto-resolve bottleneck alerts that are no longer detected', async () => {
      // Set up active alert
      mockActiveAlerts.push(createMockActiveAlert({
        id: 'alert-to-resolve',
        alert_type: 'bottleneck',
        technique_id: 'technique-1',
        metadata: { date: '2024-12-20' },
      }));

      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // No matching bottleneck alerts = should resolve
      rerender();

      await waitFor(() => {
        expect(mockResolveAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            alertId: 'alert-to-resolve',
            resolution_notes: expect.stringContaining('automaticamente'),
          })
        );
      });
    });

    it('should auto-resolve load balancing alerts that are no longer needed', async () => {
      // Set up active alert
      mockActiveAlerts.push(createMockActiveAlert({
        id: 'lb-alert-to-resolve',
        alert_type: 'load_balancing',
        metadata: {
          jobId: 'job-1',
          currentMachineId: 'machine-1',
          suggestedMachineId: 'machine-2',
        },
      }));

      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      // No matching load balancing suggestions = should resolve
      rerender();

      await waitFor(() => {
        expect(mockResolveAlert).toHaveBeenCalledWith(
          expect.objectContaining({
            alertId: 'lb-alert-to-resolve',
            resolution_notes: expect.stringContaining('automaticamente'),
          })
        );
      });
    });

    it('should not resolve alerts that are still active', async () => {
      const currentDate = new Date('2024-12-20');
      
      // Set up active alert that matches current bottleneck
      mockActiveAlerts.push(createMockActiveAlert({
        id: 'alert-should-stay',
        alert_type: 'bottleneck',
        technique_id: 'technique-1',
        metadata: { date: currentDate.toISOString() },
      }));

      // Current bottleneck matches the alert
      mockBottleneckAlerts.push(createMockBottleneckAlert({
        techniqueId: 'technique-1',
        date: currentDate,
      }));

      const { rerender } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      // Wait for initialization
      act(() => {
        vi.advanceTimersByTime(3500);
      });

      rerender();

      // Should not have resolved this alert
      expect(mockResolveAlert).not.toHaveBeenCalledWith(
        expect.objectContaining({
          alertId: 'alert-should-stay',
        })
      );
    });
  });

  describe('Manual Check Functions', () => {
    it('should show error toast when checking bottlenecks with critical alerts', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockBottleneckAlerts.push(
        createMockBottleneckAlert({ severity: 'critical' }),
        createMockBottleneckAlert({ severity: 'critical', techniqueId: 'technique-2' })
      );

      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkBottleneckAlerts();
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('2'),
        expect.objectContaining({
          description: expect.any(String),
        })
      );
    });

    it('should show warning toast when checking bottlenecks with only warnings', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockBottleneckAlerts.push(
        createMockBottleneckAlert({ severity: 'warning' })
      );

      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkBottleneckAlerts();
      });

      expect(toast.warning).toHaveBeenCalled();
    });

    it('should show success toast when no bottlenecks detected', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkBottleneckAlerts();
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Sem gargalos detectados',
        expect.objectContaining({
          description: 'Capacidade operacional normal',
        })
      );
    });

    it('should show info toast when checking load balancing with suggestions', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      mockLoadBalancingSuggestions.push(
        createMockLoadBalancingSuggestion({ jobId: 'job-1' }),
        createMockLoadBalancingSuggestion({ jobId: 'job-2' })
      );

      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkLoadBalancingAlerts();
      });

      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining('2'),
        expect.objectContaining({
          description: expect.any(String),
        })
      );
    });

    it('should show success toast when load is balanced', () => {
      const { toast } = vi.mocked(require('sonner'));
      
      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkLoadBalancingAlerts();
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Carga balanceada',
        expect.objectContaining({
          description: 'Nenhuma redistribuição necessária',
        })
      );
    });
  });

  describe('Configuration', () => {
    it('should accept custom configuration', () => {
      const customConfig = {
        enableBottleneckAlerts: false,
        enableLoadBalancingAlerts: true,
        checkIntervalMs: 30000,
      };

      const { result } = renderHook(() => useEfficiencyNotifications(customConfig), {
        wrapper: createWrapper(),
      });

      expect(result.current).toBeDefined();
    });

    it('should merge custom config with defaults', () => {
      mockBottleneckAlerts.push(createMockBottleneckAlert({ severity: 'critical' }));
      mockLoadBalancingSuggestions.push(createMockLoadBalancingSuggestion());

      const { result } = renderHook(() => useEfficiencyNotifications({
        enableBottleneckAlerts: false,
        // enableLoadBalancingAlerts should use default (true)
      }), {
        wrapper: createWrapper(),
      });

      // Both counts should still be accurate
      expect(result.current.bottleneckCount).toBe(1);
      expect(result.current.loadBalancingCount).toBe(1);
    });
  });

  describe('Navigation', () => {
    it('should navigate to alerts page when action clicked', () => {
      const { navigateTo } = vi.mocked(require('@/lib/navigation'));
      const { toast } = vi.mocked(require('sonner'));
      
      // Make toast.error capture the action callback
      let capturedAction: any;
      toast.error.mockImplementation((title, options) => {
        capturedAction = options?.action;
      });

      mockBottleneckAlerts.push(createMockBottleneckAlert({ severity: 'critical' }));

      const { result } = renderHook(() => useEfficiencyNotifications(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.checkBottleneckAlerts();
      });

      // Simulate clicking the action
      if (capturedAction?.onClick) {
        capturedAction.onClick();
      }

      expect(navigateTo).toHaveBeenCalledWith('/alerts');
    });
  });
});
