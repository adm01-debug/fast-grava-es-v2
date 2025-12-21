import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LotGenealogyView } from './LotGenealogyView';

const mockGenealogy = { lot: 'LOT-001', parents: ['LOT-000'], children: ['LOT-002', 'LOT-003'] };

describe('LotGenealogyView', () => {
  it('should render genealogy', () => {
    render(<LotGenealogyView genealogy={mockGenealogy} />);
    expect(screen.getByText(/genealogia|rastreabilidade/i)).toBeInTheDocument();
  });
  it('should show lot', () => {
    render(<LotGenealogyView genealogy={mockGenealogy} />);
    expect(screen.getByText('LOT-001')).toBeInTheDocument();
  });
});
