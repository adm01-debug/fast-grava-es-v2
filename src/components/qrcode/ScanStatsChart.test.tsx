import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScanStatsChart } from './ScanStatsChart';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart">{children}</div>,
  LineChart: ({ children }: any) => <div>{children}</div>,
  Line: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  Tooltip: () => <div />,
}));

describe('ScanStatsChart', () => {
  it('should render chart', () => {
    render(<ScanStatsChart data={[{ date: '2024-01-01', count: 50 }]} />);
    expect(screen.getByTestId('chart')).toBeInTheDocument();
  });
});
