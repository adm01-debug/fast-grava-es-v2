import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardEditControls } from './DashboardEditControls';

describe('DashboardEditControls', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnToggleEdit = vi.fn();

  it('should render edit button when not editing', () => {
    render(<DashboardEditControls isEditing={false} onToggleEdit={mockOnToggleEdit} />);
    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument();
  });

  it('should render save and cancel when editing', () => {
    render(<DashboardEditControls isEditing={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });

  it('should call onToggleEdit when clicking edit', async () => {
    render(<DashboardEditControls isEditing={false} onToggleEdit={mockOnToggleEdit} />);
    await userEvent.click(screen.getByRole('button', { name: /editar/i }));
    expect(mockOnToggleEdit).toHaveBeenCalled();
  });

  it('should call onSave when clicking save', async () => {
    render(<DashboardEditControls isEditing={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('should call onCancel when clicking cancel', async () => {
    render(<DashboardEditControls isEditing={true} onSave={mockOnSave} onCancel={mockOnCancel} />);
    await userEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
