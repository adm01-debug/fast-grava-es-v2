import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input Component', () => {
  it('should render input element', () => {
    const { getByPlaceholderText } = render(<Input placeholder="Enter text" />);
    
    expect(getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should handle value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    const { getByRole } = render(<Input onChange={handleChange} />);
    
    const input = getByRole('textbox');
    await user.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(<Input disabled />);
    
    expect(getByRole('textbox')).toBeDisabled();
  });

  it('should render with different types', () => {
    const { getByRole, rerender, container } = render(<Input type="email" />);
    expect(getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();

    rerender(<Input type="number" />);
    expect(getByRole('spinbutton')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { getByRole } = render(<Input className="custom-class" />);
    
    expect(getByRole('textbox')).toHaveClass('custom-class');
  });

  it('should forward ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('should display typed value', async () => {
    const user = userEvent.setup();
    
    const { getByRole } = render(<Input />);
    
    const input = getByRole('textbox');
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('should handle focus and blur events', async () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    const user = userEvent.setup();
    
    const { getByRole } = render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = getByRole('textbox');
    await user.click(input);
    expect(handleFocus).toHaveBeenCalled();
    
    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });
});
