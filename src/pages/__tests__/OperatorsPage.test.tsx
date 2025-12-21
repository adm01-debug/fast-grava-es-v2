import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: '1' }, isAuthenticated: true, isLoading: false }) }));

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
const Wrapper = ({ children }: any) => (<QueryClientProvider client={qc}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>);

describe('OperatorsPage', () => {
  it('should render without crashing', async () => {
    const { default: Page } = await import('../OperatorsPage');
    expect(() => render(<Page />, { wrapper: Wrapper })).not.toThrow();
  });
});
