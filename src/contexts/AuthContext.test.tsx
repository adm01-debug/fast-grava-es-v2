import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    functions: { invoke: vi.fn() },
  },
}));

const TestComponent = () => {
  const { user, loading } = useAuth();
  return <div>{loading ? 'Loading...' : user ? `User: ${user.id}` : 'No user'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('provides auth context to children', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
  });

  it('shows no user when not authenticated', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    await waitFor(() => expect(screen.getByText('No user')).toBeInTheDocument());
  });

  it('throws error when useAuth is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow();
    spy.mockRestore();
  });
});
