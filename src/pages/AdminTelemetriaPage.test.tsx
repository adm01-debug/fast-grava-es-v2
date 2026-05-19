import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminTelemetriaPage from './AdminTelemetriaPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Total mock of dependencies
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-main-layout">{children}</div>,
}));

vi.mock('@/components/admin/telemetry/TelemetryCharts', () => ({
  TelemetryCharts: () => <div data-testid="mock-charts">Charts</div>,
}));

const mockTelemetryData = [
  {
    id: '1',
    operation: 'SELECT',
    table_name: 'jobs',
    duration_ms: 1200,
    severity: 'slow',
    created_at: new Date().toISOString(),
    error_message: null
  },
  {
    id: '2',
    operation: 'RPC',
    rpc_name: 'get_user_role',
    duration_ms: 500,
    severity: 'info',
    created_at: new Date().toISOString(),
    error_message: null
  }
];

// Mock Supabase globally for this test
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockTelemetryData, error: null }),
    })),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

// Mock hooks that might be used by components in the tree
vi.mock('@/hooks/use-device', () => ({
  useDevice: () => ({ isMobile: false, prefersReducedMotion: false }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('Painel de Telemetria (Lite)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar dados de telemetria e exibir na tabela', async () => {
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AdminTelemetriaPage />
        </QueryClientProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Telemetria de Queries')).toBeDefined();
    });

    // Verificar se os dados mockados aparecem na tabela
    // Usamos getAllByText e verificamos se pelo menos um aparece
    await waitFor(() => {
      const jobElements = screen.getAllByText('jobs');
      expect(jobElements.length).toBeGreaterThan(0);
      
      const rpcElements = screen.getAllByText('get_user_role');
      expect(rpcElements.length).toBeGreaterThan(0);
    });
  });
});
