import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OEETrendChart } from './OEETrendChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart">{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  CartesianGrid: () => <div />,
}));

const mockData = [
  { date: '2024-01-01', oee: 80 },
  { date: '2024-01-02', oee: 82 },
  { date: '2024-01-03', oee: 85 },
];

describe('OEETrendChart', () => {
  it('should render trend chart', () => {
    render(<OEETrendChart data={mockData} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });

  it('should show title', () => {
    render(<OEETrendChart data={mockData} title="Tendência OEE" />);
    expect(screen.getByText('Tendência OEE')).toBeInTheDocument();
  });
});
