import { render, screen } from '@testing-library/react';
import { BIStatCard } from './BIStatCard';
import { describe, it, expect } from 'vitest';
import { Activity } from 'lucide-react';

describe('BIStatCard', () => {
  it('renders title and value', () => {
    render(
      <BIStatCard 
        title="Total Orders" 
        value="1,234" 
        icon={Activity} 
      />
    );
    
    expect(screen.getByText('Total Orders')).toBeDefined();
    expect(screen.getByText('1,234')).toBeDefined();
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
    
    expect(screen.getByText('Last 30 days')).toBeDefined();
  });

  it('renders trend value and icon when provided', () => {
    const { container } = render(
      <BIStatCard 
        title="Growth" 
        value="12%" 
        trend="up" 
        trendValue="+5%" 
        icon={Activity} 
      />
    );
    
    expect(screen.getByText('+5%')).toBeDefined();
    // Check for up arrow icon (ArrowUp)
    const arrowUp = container.querySelector('svg.text-success');
    expect(arrowUp).not.toBeNull();
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
