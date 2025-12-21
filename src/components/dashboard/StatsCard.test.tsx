import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { Activity } from 'lucide-react';

describe('StatsCard', () => {
  it('should render title and value', () => {
    render(<StatsCard title="Total" value={1234} icon={Activity} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('should format numbers', () => {
    render(<StatsCard title="Count" value={1234567} icon={Activity} />);
    expect(screen.getByText(/1.*234/)).toBeInTheDocument();
  });

  it('should show trend up indicator', () => {
    render(<StatsCard title="Sales" value={100} icon={Activity} trend={{ value: 12, direction: 'up' }} />);
    expect(screen.getByText(/12/)).toBeInTheDocument();
  });

  it('should show trend down indicator', () => {
    render(<StatsCard title="Costs" value={50} icon={Activity} trend={{ value: -5, direction: 'down' }} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(<StatsCard title="Loading" value={0} icon={Activity} isLoading />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<StatsCard title="Users" value={50} icon={Activity} description="Last 30 days" />);
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('should format currency', () => {
    render(<StatsCard title="Revenue" value={1000} icon={Activity} format="currency" />);
    expect(screen.getByText(/R\$/)).toBeInTheDocument();
  });

  it('should format percentage', () => {
    render(<StatsCard title="Rate" value={75.5} icon={Activity} format="percentage" />);
    expect(screen.getByText(/75/)).toBeInTheDocument();
  });
});
