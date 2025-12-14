import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      })),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useOperatorMachines } from './useOperatorMachines';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useOperatorMachines', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide assignMachine mutation', () => {
    const { result } = renderHook(() => useOperatorMachines(), {
      wrapper: createWrapper(),
    });

    expect(result.current.assignMachine).toBeDefined();
    expect(typeof result.current.assignMachine.mutate).toBe('function');
  });

  it('should provide getAssignedMachineIds helper', () => {
    const { result } = renderHook(() => useOperatorMachines(), {
      wrapper: createWrapper(),
    });

    expect(typeof result.current.getAssignedMachineIds).toBe('function');
    
    const machineIds = result.current.getAssignedMachineIds('some-operator-id');
    expect(Array.isArray(machineIds)).toBe(true);
  });
});
