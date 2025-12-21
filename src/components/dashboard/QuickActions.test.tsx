import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickActions } from './QuickActions';

describe('QuickActions', () => {
  const mockActions = [
    { id: '1', label: 'Novo Pedido', icon: 'plus', onClick: vi.fn() },
    { id: '2', label: 'Relatório', icon: 'file', onClick: vi.fn() },
    { id: '3', label: 'Configurações', icon: 'settings', onClick: vi.fn() },
  ];

  it('should render all actions', () => {
    render(<QuickActions actions={mockActions} />);
    expect(screen.getByText('Novo Pedido')).toBeInTheDocument();
    expect(screen.getByText('Relatório')).toBeInTheDocument();
  });

  it('should call onClick when action is clicked', async () => {
    render(<QuickActions actions={mockActions} />);
    await userEvent.click(screen.getByText('Novo Pedido'));
    expect(mockActions[0].onClick).toHaveBeenCalled();
  });

  it('should render action buttons', () => {
    render(<QuickActions actions={mockActions} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
  });

  it('should be accessible via keyboard', async () => {
    render(<QuickActions actions={mockActions} />);
    const firstButton = screen.getAllByRole('button')[0];
    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);
  });
});
