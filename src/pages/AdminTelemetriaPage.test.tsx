import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import AdminTelemetriaPage from './AdminTelemetriaPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Total mock of MainLayout to avoid provider dependencies
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-main-layout">{children}</div>,
}));

// Mock TelemetryCharts to avoid re-render issues
vi.mock('@/components/admin/telemetry/TelemetryCharts', () => ({
  TelemetryCharts: () => <div data-testid="mock-charts">Charts</div>,
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: mockTelemetryData, error: null }),
    })),
  },
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

    // Verificar se os dados mockados aparecem
    await waitFor(() => {
      expect(screen.getByText('jobs')).toBeDefined();
      expect(screen.getByText('get_user_role')).toBeDefined();
    });
  });
});
