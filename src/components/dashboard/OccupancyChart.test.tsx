import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OccupancyChart } from './OccupancyChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart">{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
}));

const mockData = [
  { machine: 'CNC-01', ocupado: 75, disponivel: 25 },
  { machine: 'CNC-02', ocupado: 60, disponivel: 40 },
  { machine: 'Prensa', ocupado: 90, disponivel: 10 },
];

describe('OccupancyChart', () => {
  it('should render chart container', () => {
    render(<OccupancyChart data={mockData} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });

  it('should render with title', () => {
    render(<OccupancyChart data={mockData} title="Ocupação" />);
    expect(screen.getByText('Ocupação')).toBeInTheDocument();
  });

  it('should render bars', () => {
    render(<OccupancyChart data={mockData} />);
    expect(screen.getByTestId('bar')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    render(<OccupancyChart data={[]} />);
    expect(screen.getByText(/sem dados|nenhum dado/i)).toBeInTheDocument();
  });
});
