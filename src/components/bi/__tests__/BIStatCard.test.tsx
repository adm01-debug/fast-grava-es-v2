import { render, screen } from '@testing-library/react';
import { BIStatCard } from '../BIStatCard';
import { describe, it, expect, vi } from 'vitest';
import { Activity } from 'lucide-react';

describe('BIStatCard', () => {
  const defaultProps = {
    title: 'Test Stat',
    value: '1,234',
    icon: Activity,
  };

  it('renders title and value correctly', () => {
    render(<BIStatCard {...defaultProps} />);
    expect(screen.getByText('Test Stat')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<BIStatCard {...defaultProps} subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders trend value and icon when provided', () => {
    const { container } = render(
      <BIStatCard {...defaultProps} trend="up" trendValue="15%" />
    );
    expect(screen.getByText('15%')).toBeInTheDocument();
    // Check for trend icon (ArrowUp)
    const arrowUp = container.querySelector('svg.text-success');
    expect(arrowUp).toBeInTheDocument();
  });

  it('applies correct variant styles', () => {
    const { container } = render(
      <BIStatCard {...defaultProps} variant="success" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-success');
  });

  it('renders neutral trend correctly', () => {
    const { container } = render(
      <BIStatCard {...defaultProps} trend="neutral" trendValue="0%" />
    );
    expect(screen.getByText('0%')).toBeInTheDocument();
    const minusIcon = container.querySelector('svg.text-muted-foreground');
    expect(minusIcon).toBeInTheDocument();
  });
});
