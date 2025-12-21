import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MLRiskDistributionChart } from './MLRiskDistributionChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart">{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
}));

const mockData = [
  { name: 'Baixo', value: 60, color: 'green' },
  { name: 'Médio', value: 30, color: 'yellow' },
  { name: 'Alto', value: 10, color: 'red' },
];

describe('MLRiskDistributionChart', () => {
  it('should render chart', () => {
    render(<MLRiskDistributionChart data={mockData} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });

  it('should show title', () => {
    render(<MLRiskDistributionChart data={mockData} title="Distribuição de Riscos" />);
    expect(screen.getByText('Distribuição de Riscos')).toBeInTheDocument();
  });
});
