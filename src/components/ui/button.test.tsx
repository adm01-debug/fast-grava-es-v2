import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './button';

describe('Button Component', () => {
  it('should render with default variant', () => {
    const { getByRole } = render(<Button>Click me</Button>);
    
    const button = getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    const { getByRole } = render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(<Button disabled>Disabled</Button>);
    
    expect(getByRole('button')).toBeDisabled();
  });

  it('should render with different variants', () => {
    const { getByRole, rerender } = render(<Button variant="destructive">Delete</Button>);
    expect(getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(getByRole('button')).toBeInTheDocument();

    rerender(<Button variant="gradient">Gradient</Button>);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    const { getByRole, rerender } = render(<Button size="sm">Small</Button>);
    expect(getByRole('button')).toBeInTheDocument();

    rerender(<Button size="lg">Large</Button>);
    expect(getByRole('button')).toBeInTheDocument();

    rerender(<Button size="icon">Icon</Button>);
    expect(getByRole('button')).toBeInTheDocument();
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>With Ref</Button>);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should render as child component when asChild is true', () => {
    const { getByRole } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = getByRole('link', { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should not trigger click when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    const { getByRole } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    await user.click(getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
