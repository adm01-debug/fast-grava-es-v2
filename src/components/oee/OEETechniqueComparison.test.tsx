import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OEETechniqueComparison } from './OEETechniqueComparison';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart">{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

const mockData = [
  { technique: 'Serigrafia', oee: 85 },
  { technique: 'Tampografia', oee: 78 },
];

describe('OEETechniqueComparison', () => {
  it('should render comparison chart', () => {
    render(<OEETechniqueComparison data={mockData} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });

  it('should show title', () => {
    render(<OEETechniqueComparison data={mockData} title="Comparação por Técnica" />);
    expect(screen.getByText('Comparação por Técnica')).toBeInTheDocument();
  });
});
