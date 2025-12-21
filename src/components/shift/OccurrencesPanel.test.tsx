import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OccurrencesPanel } from './OccurrencesPanel';

const mockOccurrences = [
  { id: '1', type: 'incident', description: 'Parada de máquina', timestamp: new Date().toISOString() },
];

describe('OccurrencesPanel', () => {
  it('should render occurrences', () => {
    render(<OccurrencesPanel occurrences={mockOccurrences} />);
    expect(screen.getByText(/ocorrências/i)).toBeInTheDocument();
  });
  it('should show descriptions', () => {
    render(<OccurrencesPanel occurrences={mockOccurrences} />);
    expect(screen.getByText('Parada de máquina')).toBeInTheDocument();
  });
});
