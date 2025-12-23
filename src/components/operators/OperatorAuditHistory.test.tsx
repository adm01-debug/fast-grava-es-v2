import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OperatorAuditHistory } from './OperatorAuditHistory';

// Mock the hook since component doesn't take props
vi.mock('@/hooks/useOperatorAudit', () => ({
  useOperatorAudit: () => ({
    data: [
      { id: '1', action: 'activated', created_at: new Date().toISOString(), operator_name: 'João', performed_by_name: 'Admin', reason: null },
      { id: '2', action: 'deactivated', created_at: new Date().toISOString(), operator_name: 'Maria', performed_by_name: 'Admin', reason: 'Férias' },
    ],
    isLoading: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OperatorAuditHistory', () => {
  it('should render history', () => {
    render(<OperatorAuditHistory />, { wrapper: createWrapper() });
    expect(screen.getByText(/histórico|auditoria/i)).toBeInTheDocument();
  });
  
  it('should show operator names', () => {
    render(<OperatorAuditHistory />, { wrapper: createWrapper() });
    expect(screen.getByText(/João/)).toBeInTheDocument();
  });
});
