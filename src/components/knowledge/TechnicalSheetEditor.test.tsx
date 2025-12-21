import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TechnicalSheetEditor } from './TechnicalSheetEditor';

describe('TechnicalSheetEditor', () => {
  const mockOnSave = vi.fn();
  const mockSheet = { id: '1', title: 'Manual CNC', content: 'Instruções...', category: 'Máquinas' };

  it('should render editor', () => {
    render(<TechnicalSheetEditor sheet={mockSheet} onSave={mockOnSave} />);
    expect(screen.getByText(/editor|editar/i)).toBeInTheDocument();
  });

  it('should display sheet title', () => {
    render(<TechnicalSheetEditor sheet={mockSheet} onSave={mockOnSave} />);
    expect(screen.getByDisplayValue('Manual CNC')).toBeInTheDocument();
  });

  it('should have content editor', () => {
    render(<TechnicalSheetEditor sheet={mockSheet} onSave={mockOnSave} />);
    expect(screen.getByText('Instruções...')).toBeInTheDocument();
  });

  it('should have save button', () => {
    render(<TechnicalSheetEditor sheet={mockSheet} onSave={mockOnSave} />);
    expect(screen.getByRole('button', { name: /salvar|save/i })).toBeInTheDocument();
  });

  it('should call onSave when saving', async () => {
    render(<TechnicalSheetEditor sheet={mockSheet} onSave={mockOnSave} />);
    await userEvent.click(screen.getByRole('button', { name: /salvar|save/i }));
    expect(mockOnSave).toHaveBeenCalled();
  });
});
