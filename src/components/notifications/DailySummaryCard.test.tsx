import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DailySummaryCard } from './DailySummaryCard';

const mockSummary = {
  date: new Date().toISOString(),
  jobsCompleted: 25, jobsPending: 10, efficiency: 85, alerts: 3
};

describe('DailySummaryCard', () => {
  it('should render summary', () => {
    render(<DailySummaryCard summary={mockSummary} />);
    expect(screen.getByText(/resumo|summary/i)).toBeInTheDocument();
  });

  it('should show jobs completed', () => {
    render(<DailySummaryCard summary={mockSummary} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should show efficiency', () => {
    render(<DailySummaryCard summary={mockSummary} />);
    expect(screen.getByText(/85%/)).toBeInTheDocument();
  });

  it('should show alerts count', () => {
    render(<DailySummaryCard summary={mockSummary} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
