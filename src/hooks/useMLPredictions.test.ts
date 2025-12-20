import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useMLPredictions, MachinePrediction, PredictionFactor } from './useMLPredictions';

// Mock Supabase
const mockSupabaseQuery = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseFunctionsInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          order: () => mockSupabaseQuery(table),
          limit: () => mockSupabaseQuery(table),
        }),
        order: () => ({
          limit: () => mockSupabaseQuery(table),
        }),
      }),
      update: (data: any) => ({
        eq: () => mockSupabaseUpdate(data),
      }),
    }),
    functions: {
      invoke: mockSupabaseFunctionsInvoke,
    },
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock error handling
vi.mock('@/lib/errorHandling', () => ({
  showErrorToast: vi.fn(),
  categorizeError: vi.fn(() => 'unknown'),
  ErrorCodes: {},
}));

// Mock query config
vi.mock('@/lib/queryConfig', () => ({
  defaultQueryOptions: {},
  STALE_TIMES: {
    DYNAMIC: 30000,
    STATIC: 300000,
  },
}));

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data factories
const createMockPrediction = (overrides: Partial<MachinePrediction> = {}): MachinePrediction => ({
  id: 'pred-1',
  machine_id: 'machine-1',
  prediction_type: 'failure_risk',
  risk_score: 75,
  confidence: 85,
  predicted_failure_date: '2024-12-25',
  factors: [
    { factor: 'High usage', impact: 'high', description: 'Machine running 24/7' },
  ],
  recommendations: ['Schedule maintenance', 'Replace worn parts'],
  model_version: 'v1.0',
  is_active: true,
  acknowledged_by: null,
  acknowledged_at: null,
  created_at: '2024-12-20T10:00:00Z',
  expires_at: '2024-12-27T10:00:00Z',
  machine: { id: 'machine-1', name: 'Laser 01', code: 'LSR-01' },
  ...overrides,
});

const createMockMachine = (overrides = {}) => ({
  id: 'machine-1',
  name: 'Laser 01',
  code: 'LSR-01',
  is_active: true,
  technique_id: 'technique-1',
  ...overrides,
});

describe('useMLPredictions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State and Data Fetching', () => {
    it('should initialize with empty arrays and loading state', () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.predictions).toEqual([]);
      expect(result.current.predictionHistory).toEqual([]);
      expect(result.current.machines).toEqual([]);
    });

    it('should fetch predictions successfully', async () => {
      const mockPredictions = [
        createMockPrediction({ id: 'pred-1', risk_score: 80 }),
        createMockPrediction({ id: 'pred-2', risk_score: 45 }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'machine_predictions') {
          return Promise.resolve({ 
            data: mockPredictions.map(p => ({ ...p, machines: p.machine })), 
            error: null 
          });
        }
        if (table === 'prediction_history') {
          return Promise.resolve({ data: [], error: null });
        }
        if (table === 'machines') {
          return Promise.resolve({ data: [], error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.predictions.length).toBe(2);
      });

      expect(result.current.predictions[0].id).toBe('pred-1');
      expect(result.current.predictions[1].id).toBe('pred-2');
    });

    it('should fetch machines for ML', async () => {
      const mockMachines = [
        createMockMachine({ id: 'machine-1', name: 'Laser 01' }),
        createMockMachine({ id: 'machine-2', name: 'Laser 02' }),
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'machines') {
          return Promise.resolve({ data: mockMachines, error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.machines.length).toBe(2);
      });
    });

    it('should handle fetch errors gracefully', async () => {
      mockSupabaseQuery.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.predictions).toEqual([]);
      });
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate stats correctly with predictions', async () => {
      const mockPredictions = [
        createMockPrediction({ id: 'pred-1', risk_score: 80, confidence: 90 }), // high
        createMockPrediction({ id: 'pred-2', risk_score: 75, confidence: 85 }), // high
        createMockPrediction({ id: 'pred-3', risk_score: 50, confidence: 70 }), // medium
        createMockPrediction({ id: 'pred-4', risk_score: 30, confidence: 60 }), // low
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'machine_predictions') {
          return Promise.resolve({
            data: mockPredictions.map(p => ({ ...p, machines: p.machine })),
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.predictions.length).toBe(4);
      });

      expect(result.current.stats.totalPredictions).toBe(4);
      expect(result.current.stats.highRisk).toBe(2); // 80, 75 >= 70
      expect(result.current.stats.mediumRisk).toBe(1); // 50 >= 40 && < 70
      expect(result.current.stats.lowRisk).toBe(1); // 30 < 40
      expect(result.current.stats.avgRiskScore).toBe(59); // (80+75+50+30)/4 = 58.75 -> 59
      expect(result.current.stats.avgConfidence).toBe(76); // (90+85+70+60)/4 = 76.25 -> 76
    });

    it('should handle empty predictions in stats', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats.totalPredictions).toBe(0);
      expect(result.current.stats.highRisk).toBe(0);
      expect(result.current.stats.mediumRisk).toBe(0);
      expect(result.current.stats.lowRisk).toBe(0);
      expect(result.current.stats.avgRiskScore).toBe(0);
      expect(result.current.stats.avgConfidence).toBe(0);
    });

    it('should count pending acknowledgments correctly', async () => {
      const mockPredictions = [
        createMockPrediction({ id: 'pred-1', risk_score: 80, acknowledged_at: null }), // pending
        createMockPrediction({ id: 'pred-2', risk_score: 60, acknowledged_at: null }), // pending
        createMockPrediction({ id: 'pred-3', risk_score: 55, acknowledged_at: '2024-12-20' }), // acknowledged
        createMockPrediction({ id: 'pred-4', risk_score: 30, acknowledged_at: null }), // low risk, not counted
      ];

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'machine_predictions') {
          return Promise.resolve({
            data: mockPredictions.map(p => ({ ...p, machines: p.machine })),
            error: null,
          });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.predictions.length).toBe(4);
      });

      expect(result.current.stats.pendingAcknowledgment).toBe(2); // only >= 50 and not acknowledged
    });
  });

  describe('getRiskLevel', () => {
    it('should return Crítico for score >= 80', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getRiskLevel(80)).toEqual({ label: 'Crítico', color: 'destructive' });
      expect(result.current.getRiskLevel(100)).toEqual({ label: 'Crítico', color: 'destructive' });
    });

    it('should return Alto for score >= 60 and < 80', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getRiskLevel(60)).toEqual({ label: 'Alto', color: 'destructive' });
      expect(result.current.getRiskLevel(79)).toEqual({ label: 'Alto', color: 'destructive' });
    });

    it('should return Médio for score >= 40 and < 60', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getRiskLevel(40)).toEqual({ label: 'Médio', color: 'warning' });
      expect(result.current.getRiskLevel(59)).toEqual({ label: 'Médio', color: 'warning' });
    });

    it('should return Baixo for score >= 20 and < 40', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getRiskLevel(20)).toEqual({ label: 'Baixo', color: 'secondary' });
      expect(result.current.getRiskLevel(39)).toEqual({ label: 'Baixo', color: 'secondary' });
    });

    it('should return Mínimo for score < 20', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getRiskLevel(0)).toEqual({ label: 'Mínimo', color: 'outline' });
      expect(result.current.getRiskLevel(19)).toEqual({ label: 'Mínimo', color: 'outline' });
    });
  });

  describe('getPredictionTypeLabel', () => {
    it('should return correct labels for prediction types', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      expect(result.current.getPredictionTypeLabel('failure_risk')).toBe('Risco de Falha');
      expect(result.current.getPredictionTypeLabel('maintenance_needed')).toBe('Manutenção Necessária');
      expect(result.current.getPredictionTypeLabel('performance_degradation')).toBe('Degradação de Performance');
      expect(result.current.getPredictionTypeLabel('unknown_type')).toBe('unknown_type');
    });
  });

  describe('generatePredictions mutation', () => {
    it('should generate predictions successfully', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseFunctionsInvoke.mockResolvedValue({
        data: { predictions_generated: 5 },
        error: null,
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.generatePredictions.mutateAsync();
      });

      expect(mockSupabaseFunctionsInvoke).toHaveBeenCalledWith('ml-predictions', {
        body: { action: 'predict', machine_id: undefined },
      });
    });

    it('should generate predictions for specific machine', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseFunctionsInvoke.mockResolvedValue({
        data: { predictions_generated: 1 },
        error: null,
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.generatePredictions.mutateAsync('machine-123');
      });

      expect(mockSupabaseFunctionsInvoke).toHaveBeenCalledWith('ml-predictions', {
        body: { action: 'predict', machine_id: 'machine-123' },
      });
    });

    it('should handle rate limit error', async () => {
      const { toast } = await import('sonner');
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseFunctionsInvoke.mockResolvedValue({
        data: { error: 'Rate limit exceeded' },
        error: null,
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.generatePredictions.mutateAsync();
        } catch (e) {
          // Expected error
        }
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Limite de requisições excedido. Tente novamente em alguns minutos.'
      );
    });

    it('should handle payment required error', async () => {
      const { toast } = await import('sonner');
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseFunctionsInvoke.mockResolvedValue({
        data: { error: 'Payment required' },
        error: null,
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.generatePredictions.mutateAsync();
        } catch (e) {
          // Expected error
        }
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Créditos insuficientes. Adicione créditos ao workspace.'
      );
    });
  });

  describe('acknowledgePrediction mutation', () => {
    it('should acknowledge prediction successfully', async () => {
      mockSupabaseQuery.mockResolvedValue({ data: [], error: null });
      mockSupabaseUpdate.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.acknowledgePrediction.mutateAsync('pred-123');
      });

      expect(mockSupabaseUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          acknowledged_at: expect.any(String),
        })
      );
    });
  });

  describe('Data Transformation', () => {
    it('should transform prediction data correctly', async () => {
      const rawPrediction = {
        id: 'pred-1',
        machine_id: 'machine-1',
        prediction_type: 'failure_risk',
        risk_score: 75,
        confidence: 85,
        factors: [{ factor: 'test', impact: 'high', description: 'desc' }],
        recommendations: ['rec1', 'rec2'],
        machines: { id: 'machine-1', name: 'Laser 01', code: 'LSR-01' },
        is_active: true,
        model_version: 'v1.0',
        acknowledged_by: null,
        acknowledged_at: null,
        created_at: '2024-12-20T10:00:00Z',
        expires_at: '2024-12-27T10:00:00Z',
        predicted_failure_date: null,
      };

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'machine_predictions') {
          return Promise.resolve({ data: [rawPrediction], error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.predictions.length).toBe(1);
      });

      const prediction = result.current.predictions[0];
      expect(prediction.machine).toEqual({ id: 'machine-1', name: 'Laser 01', code: 'LSR-01' });
      expect(prediction.factors).toEqual([{ factor: 'test', impact: 'high', description: 'desc' }]);
      expect(prediction.recommendations).toEqual(['rec1', 'rec2']);
    });

    it('should handle null/undefined factors and recommendations', async () => {
      const rawPrediction = {
        id: 'pred-1',
        machine_id: 'machine-1',
        prediction_type: 'failure_risk',
        risk_score: 50,
        confidence: 60,
        factors: null,
        recommendations: undefined,
        machines: { id: 'machine-1', name: 'Laser 01', code: 'LSR-01' },
        is_active: true,
        model_version: 'v1.0',
        acknowledged_by: null,
        acknowledged_at: null,
        created_at: '2024-12-20T10:00:00Z',
        expires_at: '2024-12-27T10:00:00Z',
        predicted_failure_date: null,
      };

      mockSupabaseQuery.mockImplementation((table) => {
        if (table === 'machine_predictions') {
          return Promise.resolve({ data: [rawPrediction], error: null });
        }
        return Promise.resolve({ data: [], error: null });
      });

      const { result } = renderHook(() => useMLPredictions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.predictions.length).toBe(1);
      });

      const prediction = result.current.predictions[0];
      expect(prediction.factors).toEqual([]);
      expect(prediction.recommendations).toEqual([]);
    });
  });
});
