import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TechnicalSheetViewer } from './TechnicalSheetViewer';

const mockSheet = { id: '1', title: 'Manual CNC', content: '# Título\n\nConteúdo técnico...', category: 'Máquinas' };

describe('TechnicalSheetViewer', () => {
  it('should render sheet title', () => {
    render(<TechnicalSheetViewer sheet={mockSheet} />);
    expect(screen.getByText('Manual CNC')).toBeInTheDocument();
  });

  it('should render markdown content', () => {
    render(<TechnicalSheetViewer sheet={mockSheet} />);
    expect(screen.getByText(/Conteúdo técnico/)).toBeInTheDocument();
  });

  it('should show category', () => {
    render(<TechnicalSheetViewer sheet={mockSheet} />);
    expect(screen.getByText('Máquinas')).toBeInTheDocument();
  });

  it('should have print button', () => {
    render(<TechnicalSheetViewer sheet={mockSheet} />);
    expect(screen.getByRole('button', { name: /imprimir|print/i })).toBeInTheDocument();
  });
});
