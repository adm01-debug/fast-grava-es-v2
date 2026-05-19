import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import InventoryPage from './InventoryPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { useInventory } from '@/features/inventory';

// Total mock of dependencies
vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-main-layout">{children}</div>,
}));

vi.mock('@/features/inventory', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    useInventory: vi.fn(),
    useInventoryMovements: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  };
});

// Mock useRBAC
vi.mock('@/features/auth', () => ({
  useRBAC: () => ({ hasPermission: () => true }),
  PermissionGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

describe('InventoryPage - Skeletons e Estabilidade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('deve exibir skeletons enquanto os itens do estoque estão carregando', async () => {
    const mockUseInventory = vi.mocked(useInventory);
    
    mockUseInventory.mockReturnValue({
      items: [],
      isLoading: true,
      recordMovement: vi.fn(),
      deleteMovement: vi.fn(),
      transferItems: vi.fn(),
      isTransferring: false,
      calculateAI: vi.fn(),
      isCalculatingAI: false,
      stats: { movementsCount24h: 0, inventoryValue: 0 },
    } as any);

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <InventoryPage />
        </QueryClientProvider>
      </MemoryRouter>
    );

    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve manter o layout estável durante a transição de carregamento', async () => {
    const mockUseInventory = vi.mocked(useInventory);

    const mockItems = [
      {
        id: '1',
        name: 'Tinta Azul',
        category: 'ink',
        current_stock: 10,
        unit: 'L',
        min_stock_level: 5,
        location: 'A1',
        specification: 'Premium',
        price_per_unit: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    mockUseInventory.mockReturnValue({
      items: mockItems,
      isLoading: false,
      recordMovement: vi.fn(),
      deleteMovement: vi.fn(),
      transferItems: vi.fn(),
      isTransferring: false,
      calculateAI: vi.fn(),
      isCalculatingAI: false,
      stats: { movementsCount24h: 2, inventoryValue: 500 },
    } as any);

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <InventoryPage />
        </QueryClientProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Tinta Azul')).toBeDefined();
    });
    
    expect(screen.getByText('10')).toBeDefined();
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards.some(c => c.textContent === 'Tinta Azul')).toBe(true);
  });
});
