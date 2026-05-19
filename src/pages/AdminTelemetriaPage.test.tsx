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

// Mock Supabase globally for this test
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
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

  it('deve renderizar o título da página', async () => {
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
  });
});
