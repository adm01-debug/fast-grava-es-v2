import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BIStatCard } from './BIStatCard';
import { Activity } from 'lucide-react';

describe('BIStatCard', () => {
  it('renders title and value correctly', () => {
    render(<BIStatCard title="Total Jobs" value="150" icon={Activity} />);
    
    expect(screen.getByText('Total Jobs')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
  });

  it('renders trend indicator when provided', () => {
    render(
      <BIStatCard 
        title="Efficiency" 
        value="92%" 
        icon={Activity} 
        trend="up" 
        trendValue="+5%" 
      />
    );
    
    expect(screen.getByText('+5%')).toBeDefined();
    const trendContainer = screen.getByTestId('trend-indicator');
    expect(trendContainer.className).toContain('text-success');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<BIStatCard title="Clickable" value="10" icon={Activity} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Clickable').closest('.card')!);
    expect(handleClick).toHaveBeenCalled();
  });
});
