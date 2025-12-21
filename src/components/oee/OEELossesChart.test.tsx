import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OEELossesChart } from './OEELossesChart';

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
  { name: 'Disponibilidade', value: 10 },
  { name: 'Performance', value: 5 },
  { name: 'Qualidade', value: 2 },
];

describe('OEELossesChart', () => {
  it('should render chart', () => {
    render(<OEELossesChart data={mockData} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });

  it('should show title', () => {
    render(<OEELossesChart data={mockData} title="Perdas OEE" />);
    expect(screen.getByText('Perdas OEE')).toBeInTheDocument();
  });
});
