import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bitrix24SyncPanel } from './Bitrix24SyncPanel';

describe('Bitrix24SyncPanel', () => {
  const mockOnSync = vi.fn();

  it('should render sync panel', () => {
    render(<Bitrix24SyncPanel onSync={mockOnSync} />);
    expect(screen.getByText(/bitrix|sincronizar/i)).toBeInTheDocument();
  });

  it('should have sync button', () => {
    render(<Bitrix24SyncPanel onSync={mockOnSync} />);
    expect(screen.getByRole('button', { name: /sincronizar|sync/i })).toBeInTheDocument();
  });

  it('should call onSync when clicking sync', async () => {
    render(<Bitrix24SyncPanel onSync={mockOnSync} />);
    await userEvent.click(screen.getByRole('button', { name: /sincronizar|sync/i }));
    expect(mockOnSync).toHaveBeenCalled();
  });

  it('should show status indicator', () => {
    render(<Bitrix24SyncPanel onSync={mockOnSync} status="connected" />);
    expect(screen.getByText(/conectado|online/i)).toBeInTheDocument();
  });
});
