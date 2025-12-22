import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OperatorGoalsCard } from './OperatorGoalsCard';

const mockGoals = [
  { id: '1', name: 'Produção', target: 1000, current: 750, unit: 'peças' },
  { id: '2', name: 'Qualidade', target: 95, current: 92, unit: '%' },
];

describe('OperatorGoalsCard', () => {
  it('should render goals', () => {
    render(<OperatorGoalsCard goals={mockGoals} />);
    expect(screen.getByText('Produção')).toBeInTheDocument();
  });
  it('should show progress', () => {
    render(<OperatorGoalsCard goals={mockGoals} />);
    expect(screen.getByText(/750/)).toBeInTheDocument();
  });
  it('should show target', () => {
    render(<OperatorGoalsCard goals={mockGoals} />);
    expect(screen.getByText(/1000|1.000/)).toBeInTheDocument();
  });
});
