import { render, screen } from '@testing-library/react';
import { BIStatCard } from '../BIStatCard';
import { describe, it, expect } from 'vitest';
import { Activity } from 'lucide-react';
import '@testing-library/jest-dom';

describe('BIStatCard', () => {
  it('renders title and value', () => {
    render(
      <BIStatCard 
        title="Total Orders" 
        value="1,234" 
        icon={Activity} 
      />
    );
    
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <BIStatCard 
        title="Revenue" 
        value="$50k" 
        subtitle="Last 30 days" 
        icon={Activity} 
      />
    );
    
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders trend value and container when provided', () => {
    render(
      <BIStatCard 
        title="Growth" 
        value="12%" 
        trend="up" 
        trendValue="+5%" 
        icon={Activity} 
      />
    );
    
    expect(screen.getByText('+5%')).toBeInTheDocument();
    const trendIndicator = screen.getByTestId('trend-indicator');
    expect(trendIndicator).toHaveClass('text-success');
  });

  it('applies variant styles correctly', () => {
    const { container } = render(
      <BIStatCard 
        title="Critical" 
        value="5" 
        variant="danger" 
        icon={Activity} 
      />
    );
    
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-primary/30');
    expect(card.className).toContain('bg-primary/5');
  });
});






