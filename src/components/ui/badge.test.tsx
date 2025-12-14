import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { Badge } from './badge';

describe('Badge Component', () => {
  it('should render with default variant', () => {
    render(<Badge>Default</Badge>);
    
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(screen.getByText('Secondary')).toBeInTheDocument();

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(screen.getByText('Destructive')).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  it('should render children correctly', () => {
    render(
      <Badge>
        <span data-testid="child">Child Element</span>
      </Badge>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
