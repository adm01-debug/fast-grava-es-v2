import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotificationsProvider, useNotificationsContext } from './NotificationsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({ select: vi.fn(() => ({ order: vi.fn(() => ({ limit: vi.fn(() => Promise.resolve({ data: [], error: null })) })) })) })),
    auth: { getUser: vi.fn(() => Promise.resolve({ data: { user: { id: '1' } } })) },
    channel: vi.fn(() => ({ on: vi.fn(() => ({ subscribe: vi.fn() })) })),
    removeChannel: vi.fn(),
  },
}));

const TestComponent = () => {
  const { notifications } = useNotificationsContext();
  return <div data-testid="count">{notifications.length}</div>;
};

describe('NotificationsContext', () => {
  it('provides notifications context', () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <NotificationsProvider><TestComponent /></NotificationsProvider>
      </QueryClientProvider>
    );
    expect(screen.getByTestId('count')).toBeInTheDocument();
  });
});
