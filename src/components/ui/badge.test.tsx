import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge Component', () => {
  it('should render with default variant', () => {
    const { getByText } = render(<Badge>Default</Badge>);
    
    expect(getByText('Default')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { getByText, rerender } = render(<Badge variant="secondary">Secondary</Badge>);
    expect(getByText('Secondary')).toBeInTheDocument();

    rerender(<Badge variant="destructive">Destructive</Badge>);
    expect(getByText('Destructive')).toBeInTheDocument();

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(getByText('Outline')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { getByText } = render(<Badge className="custom-class">Custom</Badge>);
    
    expect(getByText('Custom')).toHaveClass('custom-class');
  });

  it('should render children correctly', () => {
    const { getByTestId } = render(
      <Badge>
        <span data-testid="child">Child Element</span>
      </Badge>
    );
    
    expect(getByTestId('child')).toBeInTheDocument();
  });
});
