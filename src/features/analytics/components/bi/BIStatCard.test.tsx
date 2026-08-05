import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BIStatCard } from './BIStatCard';
import { Activity } from 'lucide-react';

describe('BIStatCard', () => {
  it('renders correctly with basic props', () => {
    render(
      <BIStatCard 
        title="Test Stat" 
        value="1,234" 
        icon={Activity} 
      />
    );
    
    expect(screen.getByText('Test Stat')).toBeDefined();
    expect(screen.getByText('1,234')).toBeDefined();
  });

  it('shows trend indicator when trend prop is provided', () => {
    render(
      <BIStatCard 
        title="Trend Stat" 
        value="85%" 
        icon={Activity} 
        trend="up" 
        trendValue="12%" 
      />
    );
    
    expect(screen.getByText('12%')).toBeDefined();
    const trendIndicator = screen.getByTestId('trend-indicator');
    expect(trendIndicator.className).toContain('text-success');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(
      <BIStatCard 
        title="Clickable Stat" 
        value="100" 
        icon={Activity} 
        onClick={handleClick}
      />
    );
    
    fireEvent.click(screen.getByText('Clickable Stat'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
